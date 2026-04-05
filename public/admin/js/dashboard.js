let barChart = null;
let donutChart = null;
let lineChartYear = null;
const getChartRevenue = (value) => {
    fetch(`/admin/dashboard/revenue-category?filter=${value}`)
        .then(res => res.json())
        .then(data => {
            const labels = data.data.map(item => item._id);
            const revenues = data.data.map(item => item.revenue);
            total = revenues.reduce((sum,item) => sum+item,0);
            const spanTotal = document.querySelector("#totalRevenue");
            spanTotal.innerHTML = total.toLocaleString();
            //Bar Chart
            const ctx = document.getElementById('myChart');
            if (barChart) {
                barChart.destroy();
            }
            barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                label: 'Doanh thu theo danh mục sản phẩm',
                data: revenues,
                borderWidth: 1
                }]
            },
            options: {
                scales: {
                y: {
                    beginAtZero: true
                }
                }
            }
            });
            //donut Chart
            const ctxBarChart = document.querySelector("#donutChart");
            if (donutChart) {
                donutChart.destroy();
            }
            donutChart = new Chart(ctxBarChart,{
                type: "doughnut",
                data: {
                    labels:labels,
                    datasets: [{
                        label: "Tỉ lệ danh mục sản phẩm",
                        data: revenues,
                        backgroundColor: [
                            '#5DA5DA', // xanh dương
                            '#60BD68', // xanh lá
                            '#F17CB0', // hồng
                            '#FF9DA7', // đỏ nhạt
                            '#B2912F', // vàng nâu
                            '#B276B2', // tím
                            '#F15854', // đỏ cam
                            '#4D4D4D'  // xám
                        ],
                        hoverOffset: 4
                    }]
                }
            })
        })
}
const filterSelect = document.querySelector("[filterSelect]");
if(filterSelect){
    filterSelect.addEventListener("change", (e) => {
        const value = e.target.value;
        getChartRevenue(value);
    })
}
getChartRevenue(filterSelect.value);

//slide
const swiper = new Swiper('.swiper', {
  slidesPerView: 3, // hiển thị 4 sản phẩm cùng lúc
  spaceBetween: 20,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  breakpoints: {
    1024: { slidesPerView: 4 },
    768: { slidesPerView: 2 },
    480: { slidesPerView: 1 },
  }
});
// === Doanh thu 6 tháng gần nhất (Line Chart) ===
const getChartRevenueYear = () => {
    fetch(`/admin/dashboard/revenue-year`)
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById("lineChartYear");
            if(lineChartYear) lineChartYear.destroy();

            lineChartYear = new Chart(ctx, {
                type: "line",
                data: data,
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Doanh thu 6 tháng gần nhất' }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        });
}
getChartRevenueYear();

