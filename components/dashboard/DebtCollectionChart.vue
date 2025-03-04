<template>
  <div class="chart-container">
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const supabase = useSupabaseClient();
const chartData = ref(null);
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Amount",
      },
    },
  },
});

// Function to get month name from date
const getMonthName = (date) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthNames[new Date(date).getMonth()];
};

// Function to get last 6 months
const getLast6Months = () => {
  const months = [];
  const today = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      date: d,
      label: `${getMonthName(d)} ${d.getFullYear()}`,
    });
  }

  return months;
};

const user = useSupabaseUser();
// Fetch data and prepare chart
const fetchChartData = async () => {
  const months = getLast6Months();
  const labels = months.map((m) => m.label);
  const debtData = [];
  const collectionData = [];

  // For each month, get the credit sales and payments
  for (const month of months) {
    const startOfMonth = new Date(
      month.date.getFullYear(),
      month.date.getMonth(),
      1
    ).toISOString();
    const endOfMonth = new Date(
      month.date.getFullYear(),
      month.date.getMonth() + 1,
      0,
      23,
      59,
      59
    ).toISOString();

    // Get total credit sales for the month
    const { data: salesData } = await supabase
      .from("credit_sales")
      .select("total_amount")
      .eq("merchant_id", user.value?.id)
      .gte("created_at", startOfMonth)
      .lte("created_at", endOfMonth);

    const totalSales =
      salesData?.reduce(
        (sum, sale) => sum + parseFloat(sale.total_amount),
        0
      ) || 0;
    debtData.push(totalSales);

    // Get total payments for the month
    const { data: paymentsData } = await supabase
      .from("payments")
      .select(
        `amount, credit_sales (
      merchant_id
      )
      `
      )
      .gte("payment_date", startOfMonth)
      .lte("payment_date", endOfMonth);

    const totalPayments =
      paymentsData?.reduce((sum, payment) => {
        if (payment.credit_sales.merchant_id === user.value?.id) {
          return sum + parseFloat(payment.amount);
        }
        return sum;
      }, 0) || 0;
    collectionData.push(totalPayments);
  }

  // Set chart data
  chartData.value = {
    labels,
    datasets: [
      {
        label: "Credit Sales",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        data: debtData,
      },
      {
        label: "Collections",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        data: collectionData,
      },
    ],
  };
};

onMounted(fetchChartData);
</script>

<style scoped>
.chart-container {
  height: 300px;
}
</style>
