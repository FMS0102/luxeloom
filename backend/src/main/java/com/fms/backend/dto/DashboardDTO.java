package com.fms.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardDTO {

    private List<ChannelSaleData> salesByChannel;

    private Map<String, Long> itemsSoldByCategory;

    private Long totalSalesCount;

    private BigDecimal totalRevenue;

    private List<MonthlyRevenueData> revenueByMonth;

    public DashboardDTO() {
    }

    public DashboardDTO(List<ChannelSaleData> salesByChannel, Map<String, Long> itemsSoldByCategory, Long totalSalesCount, BigDecimal totalRevenue) {
        this.salesByChannel = salesByChannel;
        this.itemsSoldByCategory = itemsSoldByCategory;
        this.totalSalesCount = totalSalesCount;
        this.totalRevenue = totalRevenue;
    }

    public List<ChannelSaleData> getSalesByChannel() {
        return salesByChannel;
    }

    public void setSalesByChannel(List<ChannelSaleData> salesByChannel) {
        this.salesByChannel = salesByChannel;
    }

    public Map<String, Long> getItemsSoldByCategory() {
        return itemsSoldByCategory;
    }

    public void setItemsSoldByCategory(Map<String, Long> itemsSoldByCategory) {
        this.itemsSoldByCategory = itemsSoldByCategory;
    }

    public Long getTotalSalesCount() {
        return totalSalesCount;
    }

    public void setTotalSalesCount(Long totalSalesCount) {
        this.totalSalesCount = totalSalesCount;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<MonthlyRevenueData> getRevenueByMonth() {
        return revenueByMonth;
    }

    public void setRevenueByMonth(List<MonthlyRevenueData> revenueByMonth) {
        this.revenueByMonth = revenueByMonth;
    }

    public static class MonthlyRevenueData {
        private Integer year;
        private Integer month;
        private BigDecimal revenue;

        public MonthlyRevenueData() {
        }

        public MonthlyRevenueData(Integer year, Integer month, BigDecimal revenue) {
            this.year = year;
            this.month = month;
            this.revenue = revenue;
        }

        public Integer getYear() {
            return year;
        }

        public void setYear(Integer year) {
            this.year = year;
        }

        public Integer getMonth() {
            return month;
        }

        public void setMonth(Integer month) {
            this.month = month;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }
    }

    public static class ChannelSaleData {
        private String channel;
        private Long count;

        public ChannelSaleData(String channel, Long count) {
            this.channel = channel;
            this.count = count;
        }

        public ChannelSaleData() {
        }

        public ChannelSaleData(Long count, String channel) {
            this.count = count;
            this.channel = channel;
        }

        public String getChannel() {
            return channel;
        }

        public void setChannel(String channel) {
            this.channel = channel;
        }

        public Long getCount() {
            return count;
        }

        public void setCount(Long count) {
            this.count = count;
        }
    }
}
