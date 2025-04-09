const API_GET_DATA ="https://get-data-iot.vercel.app/get-data-3";
const API_GET_NEWEST_RECORD = "https://get-data-iot.vercel.app/get-newest-record";
const API_GET_WATER_DATA = "https://get-data-iot.vercel.app/get-data-water-volumn";
const API_GET_NEWEST_WATER_RECORD = "https://get-data-iot.vercel.app/get-newest-record-water";

const maxPoints = 200; // tối đa điểm hiển thị trên chart
const stepLabel = 50;
const waterMaxPoints = 5;
const chartDataConfigs = {};
let currentChartConfig = null;
let currentChart = null;
document.addEventListener("DOMContentLoaded", async() => {
    const dataFromAPI = await getDataFromAPI(API_GET_DATA);
    const { 
        Humidity: airHumData,
        Temprature: tempData,
        Light: lightData,
        SoilHumidity: soilHumData,
        Time: timeData 
    } = dataFromAPI;

    const waterDataFromAPI = await getDataFromAPI(API_GET_WATER_DATA);
    const {
        waterVolumn: waterData,
        time: waterTimeData } = waterDataFromAPI;

    chartDataConfigs.temp ={
        labels: timeData.slice(-maxPoints).map(formattedTimes3),
        labelUnit: "Thời gian (10 phút)",
        values: tempData.slice(-maxPoints),
        valueUnit:"°C"
    };
    chartDataConfigs.airHum = {
        labels: timeData.slice(-maxPoints).map(formattedTimes3),
        labelUnit: "Thời gian (10 phút)",
        values: airHumData.slice(-maxPoints),
        valueUnit:"%"
    };
    chartDataConfigs.soilHum = {
        labels: timeData.slice(-maxPoints).map(formattedTimes3),
        labelUnit: "Thời gian (10 phút)",
        values: soilHumData.slice(-maxPoints),
        valueUnit:"%"
    };
    chartDataConfigs.light = {
        labels: timeData.slice(-maxPoints).map(formattedTimes3),
        labelUnit: "Thời gian (10 phút)",
        values: lightData.slice(-maxPoints),
        valueUnit:"LUX"
    };

    const waterDataConfig ={
        labels:waterTimeData.slice(-waterMaxPoints).map(formattedTimes2),
        labelsUnit: "Thời gian (ngày)",
        values:waterData.slice(-waterMaxPoints),
        valueUnit:"ml" 
    };

    const mainCtx = document.getElementById("mainChart");
    currentChartConfig = chartDataConfigs.temp;
    currentChart = initLineChart(mainCtx, "Nhiệt độ (°C)",currentChartConfig, maxPoints,40);
        
    const tempCtx = document.getElementById("tempChart");
    initLineChart(tempCtx, "Nhiệt độ (°C)", chartDataConfigs.temp, maxPoints, stepLabel);

    const airHumCtx = document.getElementById("airHumChart");
    initLineChart(airHumCtx, "Độ ẩm không khí (%)", chartDataConfigs.airHum, maxPoints,stepLabel);

    const soilHumCtx = document.getElementById("soilHumChart");
    initLineChart(soilHumCtx, "Độ ẩm đất (%)",chartDataConfigs.soilHum, maxPoints, stepLabel);

    const lightCtx = document.getElementById("lightChart");
    initLineChart(lightCtx, "Ánh sáng (LUX)", chartDataConfigs.light, maxPoints, stepLabel);
    
    const waterCtx = document.getElementById("waterChart");
    initColumnChart(waterCtx,"Lượng nước tưới (ml)",waterDataConfig, waterMaxPoints);
    
});

function initColumnChart(context, lineLabel="Chart", dataConfig, maxPoints,stepLabel=2){
    if(context == null) return;
    const ctx = context.getContext("2d");
    const { labels, labelUnit, values, valueUnit } = dataConfig;
    const chartData  ={
        labels: labels,
        datasets:[{
            label: lineLabel,
            data: values,
            barThickness: 23,
            maxBarThickness: 25, 
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(77, 177, 177, 0.83)"
        }]
    };
    const chartOptions = {
        responsive: true,
        animation: false,
        scales: {
            x: {
                title: {
                display: true,
                text: labelUnit
                },
                ticks: {
                    // minRotation: 40, //chỉnh độ nghiên của label
                    callback: function(value, index, ticks) {
                        return (index % stepLabel === 0)? this.getLabelForValue(value) : '';
                    }
                }
            },
            y: {
                title: {
                display: true,
                text: valueUnit
                },    
                beginAtZero: true,
                suggestedMax: 10
            }
        }
    };
    const columnChart = new Chart(ctx, {
        type:"bar",
        data: chartData,
        options: chartOptions
    });
    let isFallbackStarted = false;
    safeStartData();

    function safeStartData() {
        if (!isFallbackStarted) {
            isFallbackStarted = true;
            startWaterDataInterval(chartData, columnChart, maxPoints, API_GET_NEWEST_WATER_RECORD);
            // startFakeIntDataInterval(min=0,range=1000, chartData, columnChart, maxPoints);
        }
    }
    async function startWaterDataInterval(chartData, chartInstance, maxPoints, url) {
        setInterval(async() => {
            const {
                volumn: waterData,
                createAt: waterTimeData
            } = await getDataFromAPI(url);

            console.log("ML: "+waterData);
            console.log("Time:  "+waterTimeData);
            // if(formattedTimes2(waterTimeData) === chartData.labels[chartData.label.length -1]) return;
            addChartData(chartData, chartInstance, formattedTimes2(waterTimeData), parseFloat(waterData), maxPoints );
        }, 5*1000);
    }
}

function initLineChart(context, columnLabel, dataConfig, maxPoints, stepLabel=5){
    if(context == null) return;
    const ctx = context.getContext("2d");
    const  {labels, labelUnit, values, valueUnit} =  dataConfig;
    const chartData = {
        labels: labels,// [] nếu rỗng
        datasets: [{
            label: columnLabel,
            data: values,// [] nếu rỗng
            fill: false,
            tension: 0.3,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(77, 177, 177, 0.83)"
            }]
    };

    const chartOptions = {
        responsive: true,
        animation: false,
        elements: {
            point: {
                radius: 0 
            }
        },
        scales: {
        x: {
            title: {
            display: true,
            text: labelUnit
            },
            ticks: {
                minRotation: 0,
                maxRotation: 0,
                autoSkip: false,
                callback: function(value, index, ticks) {
                    return (index % stepLabel === 0) ? this.getLabelForValue(value) : '';
                    // const label = this.getLabelForValue(value);
                    // const shortLabel = label.length > 15 ? label.slice(0, 15) + "..." : label;
                    // return (index % step === 0) ? shortLabel : '';

                }
            }
        },
        y: {
            title: {
            display: true,
            text: valueUnit
            }
        }
        }
    };

    const lineChart = new Chart(ctx, {
        type: "line",
        data: chartData,
        options: chartOptions
    });
    let isFallbackStarted = false;
    safeStartFakeData();
    

    function safeStartFakeData() {
        if (!isFallbackStarted) {
            isFallbackStarted = true;
            startDataInterval(chartData, lineChart, maxPoints, API_GET_NEWEST_RECORD, tyleData="TEMP");
            // startFakeFloatDataInterval(27, 5, chartData, lineChart, maxPoints);
        }
    }

    async function startDataInterval(chartData, chartInstance, maxPoints, url, tyleData="TEMP") {
        lineChart._intervalId = setInterval(async() => {
            const { 
                Humidity: airHumData,
                Temperature: tempData,
                Light: lightData,
                SoilHumidity: soilHumData,
                createAt: timeData
            } = await getDataFromAPI(url);
            let value = tempData;
            switch(tyleData){
                case "TEMP":
                    value = tempData;
                    break;
                case "AIR_HUM":
                    value = airHumData;
                    break;
                case "SOIL_HUM":
                    value = soilHumData;
                    break;
                case "LIGHT":
                    value = lightData;
                    break; 
            }
            // if(formattedTimes3(timeData) === chartData.labels[chartData.label.length -1]) return;
            addChartData(chartData, chartInstance, formattedTimes3(timeData), value, maxPoints );
        }, 5*1000);
    }
    return lineChart;
}


async function getDataFromAPI(url){
    try{
        const reponse = await fetch(url);
        if(!reponse.ok){
            throw new Error('Reponse status: ${reponse.status}');
        }
        const json = await reponse.json();
        console.log(json);
        return json;
    }catch(error){
        console.log(error);
        return error;
    }
}


function addChartData(chartData, chart, label, value, maxPoints){
    chartData.labels.push(label);
    chartData.datasets[0].data.push(value);

    if (chartData.labels.length > maxPoints) {
        chartData.labels.shift();
        chartData.datasets[0].data.shift();
    }

    chart.update();
}

function changeChartType() {
    const selectedValue = document.getElementById("selectChart").value;
    initLineChartWrapper(selectedValue);
}
function initLineChartWrapper(type) {
    if (currentChart) {
        if (currentChart._intervalId) {
            clearInterval(currentChart._intervalId);
        }
        currentChart.destroy(); // Xóa biểu đồ cũ nếu có
    }
    const dataConfig = chartDataConfigs[type]; // Lấy dữ liệu mới từ chartConfigs

    const title = {
        temp: "Nhiệt độ (°C)",
        airhum: "Độ ẩm không khí (%)",
        soilHum: "Độ ẩm đất (%)",
        light: "Ánh sáng (lux)"
    }[type];
    const mainCtx = document.getElementById("mainChart");
    currentChart = initLineChart(mainCtx, title, dataConfig, maxPoints);
}
function chagePumpSatus(){
    const txtPumpStatus = document.getElementById('txtPumStatus');
    const cbPumpStatus = document.getElementById('cbPumpStatus');
    if (cbPumpStatus.checked){
        txtPumpStatus.textContent = "Đang bật";
    }else{
        txtPumpStatus.textContent = "Đang tắt";
    }
}
function formattedTimes1(timeString){
    return new Date(timeString).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

function formattedTimes2(timeString){
    return new Date(timeString).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    });
};

function formattedTimes3(timeString){
    return new Date(timeString).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
    });
};

// function startFakeIntDataInterval(min, range, chartData, chartInstance, maxPoints) {
//     setInterval(() => {
//         const now = new Date().toLocaleString('vi-VN', {
//             hour: '2-digit',
//             minute: '2-digit',
//             day: '2-digit',
//             month: '2-digit'
//         });
//         const temp = parseInt(min + Math.random() * range);
//         addChartData(chartData, chartInstance, now, temp, maxPoints );
//     }, 10000);
// }

// function startFakeFloatDataInterval(min, range, chartData, chartInstance, maxPoints) {
//     setInterval(() => {
//         const now = new Date().toLocaleString('vi-VN', {
//             hour: '2-digit',
//             minute: '2-digit',
//             day: '2-digit',
//             month: '2-digit'
//         });
//         const temp = (min + Math.random() * range).toFixed(2);
//         addChartData(chartData, chartInstance,now, temp, maxPoints);
//     }, 10000);
// }


    // const tempDataConfig ={
    //     labels: ['08:00', '09:00', '10:00', '11:00', '12:00'],
    //     labelUnit: "Thời gian",
    //     values:[27.2, 27.8, 28.3, 28.5, 29.0],
    //     valueUnit:"°C"
    // };


        // try {
    //     const socket = new WebSocket("ws://localhost:3000");
    //     socket.onopen = () => console.log("WebSocket connected");
    //     socket.onerror = (err) => {
    //         console.error("WebSocket error:", err);
    //         safeStartFakeData();
    //     };
    //     socket.onclose = () => {
    //         console.warn("WebSocket closed");
    //         safeStartFakeData();
    //     };
    //     socket.onmessage = (event) => {
    //         try {
    //             const parsed = JSON.parse(event.data);
    //             const { time, temp } = parsed;
    //             if (time && typeof temp === "number") {
    //                 addChartData(chartData, columnChart, now, temp, maxPoints);
    //             }
    //         } catch (err) {
    //             console.error("Invalid WebSocket data", err);
    //         }
    //     };
    // } catch (e) {
    //     console.error("WebSocket connection failed:", e);
    //     safeStartFakeData();
    // }  


        // console.log("Label được thêm: "+ label);
    // console.log("Value được thêm: "+value);
    // console.log("Toàn bộ labels:", chartData.labels);
    // console.log("Toàn bộ data:", chartData.datasets[0].data);