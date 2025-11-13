package com.fms.backend.services;

import com.fms.backend.dto.*;
import com.fms.backend.exceptions.validation.ResourceNotFoundException;
import com.fms.backend.exceptions.validation.ValidationException;
import com.fms.backend.mappers.SaleMapper;
import com.fms.backend.models.Product;
import com.fms.backend.models.Sale;
import com.fms.backend.models.SaleItem;
import com.fms.backend.repositories.SaleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductService productService;
    private final SaleMapper saleMapper;

    private final Logger logger = LoggerFactory.getLogger(SaleService.class);

    public SaleService(SaleRepository saleRepository, ProductService productService, SaleMapper saleMapper) {
        this.saleRepository = saleRepository;
        this.productService = productService;
        this.saleMapper = saleMapper;
    }

    @Transactional
    public SaleResponseDTO registerSale(SaleRequestDTO dto) {
        logger.info("Register sale");

        Sale sale = new Sale();
        sale.setSaleDate(dto.getSaleDate());
        sale.setClient(dto.getClient());
        sale.setSaleChannel(dto.getSaleChannel());


        BigDecimal totalSaleAmount = BigDecimal.ZERO;
        List<SaleItem> saleItems = new ArrayList<>();

        for (SaleItemRequestDTO itemDto : dto.getItems()) {

            Product product = productService.findEntityById(itemDto.getProductId());

            if (itemDto.getQuantity() > product.getQuantityStock()) {
                throw new ValidationException(
                        "Quantidade insuficiente. Produto: " + product.getName() +
                                ", Disponível: " + product.getQuantityStock() +
                                ", Solicitado: " + itemDto.getQuantity()
                );
            }

            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setProduct(product);
            saleItem.setQuantity(itemDto.getQuantity());

            saleItem.setUnitAtPrice(product.getPrice());

            BigDecimal subTotal = product.getPrice().multiply(new BigDecimal(itemDto.getQuantity()));
            saleItem.setSubTotal(subTotal);

            totalSaleAmount = totalSaleAmount.add(subTotal);
            saleItems.add(saleItem);

            productService.updateStock(product.getId(), itemDto.getQuantity());
        }

        sale.setTotalValue(totalSaleAmount);
        sale.setItems(saleItems);
        saleRepository.save(sale);

        Sale savedSale = saleRepository.save(sale);

        return saleMapper.toDTO(savedSale);

    }

    @Transactional(readOnly = true)
    public Page<SaleResponseDTO> findAll(
            Long categoryId,
            String clientName,
            int page, int size)
    {
        logger.info("Sale Service: FindAll.");
        var pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<Sale> sales;
        if (categoryId != null) {
            sales = saleRepository.findSalesByProductCategory(categoryId, pageable);
        } else if (clientName != null && !clientName.isBlank()) {
            sales = saleRepository.findByClient(clientName, pageable);
        } else {
            sales = saleRepository.findAll(pageable);
        }

        return sales.map(saleMapper::toDTO);
    }


    @Transactional(readOnly = true)
    public SaleResponseDTO findById(Long id) {
        logger.info("Find sale by id: {}", id);
        var entity = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venda não encontrada para o ID: " + id));

        return saleMapper.toDTO(entity);
    }

    @Transactional(readOnly = true)
    private Sale findEntityById(Long id) {
        logger.info("Find entity by id: {}", id);

        return saleRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Venda não encontrada para esse id: " + id)
        );
    }

    @Transactional
    public SaleResponseDTO patch(Long id, SaleRequestDTO dto) {
        logger.info("Patch sale with id {}.", id);
        Sale sale = findEntityById(id);

        saleMapper.updateEntityFromDto(dto, sale);
        saleRepository.save(sale);

        return saleMapper.toDTO(sale);
    }

    @Transactional
    public void delete(Long id) {
        logger.info("Delete sale by id {}.", id);
        Sale sale = findEntityById(id);
        saleRepository.delete(sale);
    }

    @Transactional(readOnly = true)
    public DashboardDTO getDashboardData() {
        DashboardDTO dashboard = new DashboardDTO();

        // 1. Vendas por Canal (Sales By Channel)

        List<Object[]> salesByChannelResults = saleRepository.countSalesByChannel();
        List<DashboardDTO.ChannelSaleData> channelData = salesByChannelResults.stream()
                .map(result -> new DashboardDTO.ChannelSaleData(
                        result[0].toString(),
                        (Long) result[1]
                )).collect(Collectors.toList());

        dashboard.setSalesByChannel(channelData);

        // 2. Itens Vendidos por Categoria (Items Sold By Category)

        List<Object[]> itemsByCategoryResults = saleRepository.sumItemsSoldByCategory();
        Map<String, Long> itemsByCategoryMap = new HashMap<>();

        for (Object[] result : itemsByCategoryResults) {
            itemsByCategoryMap.put((String) result[0], (Long) result[1]);
        }
        // 3. Totais (Total Sales Count e Total Revenue)

        dashboard.setItemsSoldByCategory(itemsByCategoryMap);
        dashboard.setTotalSalesCount(saleRepository.count());

        BigDecimal totalRevenue = saleRepository.sumTotalRevenue().orElse(BigDecimal.ZERO);
        dashboard.setTotalRevenue(totalRevenue);

        // 4. Vendas por Mês/Ano (Revenue by Month)
        List<Object[]> revenueByMonthResults = saleRepository.sumRevenueByMonth();
        List<DashboardDTO.MonthlyRevenueData> monthlyData = revenueByMonthResults.stream()
                .map(result -> new DashboardDTO.MonthlyRevenueData(
                        ((Number) result[0]).intValue(),
                        ((Number) result[1]).intValue(),
                        (BigDecimal) result[2]
                )).collect(Collectors.toList());

        dashboard.setRevenueByMonth(monthlyData);

        return dashboard;
    }


}



