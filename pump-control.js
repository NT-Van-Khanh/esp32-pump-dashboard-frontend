const API_GET_PUMP_STATUS = "http://192.168.90.106/pump/control/get-status";
const API_PUMP_CONTROL_ON= "http://192.168.90.106/pump/control/on";    
const API_PUMP_CONTROL_OFF= "http://192.168.90.106/pump/control/off"; 

const API_GET_WATERING_STATUS = "http://192.168.90.106/pump/watering/get-status";
const API_PUMP_WATERING_ON= "http://192.168.90.106/pump/watering/on";    
const API_PUMP_WATERING_OFF= "http://192.168.90.106/pump/watering/off"; 

const cbPumpStatus = document.getElementById("cbPumpStatus");
const txtPumpStatus = document.getElementById('txtPumStatus');

const txtWateringStatus = document.getElementById('txtWateringStatus');
const cbWateringStatus = document.getElementById('cbWateringStatus');

const overlay = document.getElementById("loadingOverlay");

function changePumpSatus(){
    if (cbPumpStatus.checked){
        txtPumpStatus.textContent = "Đang bật";
    }else{
        txtPumpStatus.textContent = "Đang tắt";
    }
}

function changeWateringSatus(){
  if(cbWateringStatus.checked){
    txtWateringStatus.textContent = "Đang tưới nước...";
  }else{
    txtWateringStatus.textContent = "Đang không tưới nước";
  }
}

async function fetchGetPumpStatus() {
    try {
      overlay.style.display = "flex"; // Hiện loading
      document.body.style.pointerEvents = "none"; // Khóa thao tác
      const res = await fetch(API_GET_PUMP_STATUS);
      const status = await res.text(); 

      const isOn = status.trim().toLowerCase() === "on";
      cbPumpStatus.checked = isOn;
      txtPumpStatus.textContent = isOn ? "Đang bật" : "Đang tắt";
      cbWateringStatus.disabled = !isChecked;
    } catch (error) {
      console.error("Không thể lấy trạng thái máy bơm:", error);
      cbWateringStatus.disabled = true;
    }finally{
      overlay.style.display = "none"; // Ẩn loading
      document.body.style.pointerEvents = "auto"; // Mở lại thao tác
    }
  }


async function togglePumpStatus(e) {
    const isChecked = e.target.checked;
    const apiUrl = isChecked ? API_PUMP_CONTROL_ON : API_PUMP_CONTROL_OFF;
    try {
      overlay.style.display = "flex"; // Hiện loading
      document.body.style.pointerEvents = "none"; // Khóa thao tác
      
      const res = await fetch(apiUrl);
      const text = await res.text();
      console.log("Phản hồi từ ESP32:", text);
      txtPumpStatus.textContent = isChecked ? "Đang bật" : "Đang tắt";
      cbWateringStatus.disabled = !isChecked;
    } catch (error) {
      console.error("Lỗi điều khiển máy bơm:", error);
      cbPumpStatus.checked = !isChecked;
      cbWateringStatus.disabled = true;
    }finally{
      overlay.style.display = "none"; // Ẩn loading
      document.body.style.pointerEvents = "auto"; // Mở lại thao tác
    }
  }

async function fetchGetWateringStatus() {
  try {
      overlay.style.display = "flex"; // Hiện loading
      document.body.style.pointerEvents = "none"; // Khóa thao tác
      
      const res = await fetch(API_GET_WATERING_STATUS);
      const status = await res.text(); 

      const isOn = status.trim().toLowerCase() === "on";
      cbWateringStatus.checked = isOn;
      txtWateringStatus.textContent = isOn ? "Đang bật" : "Đang tắt";
    } catch (error) {
      console.error("Không thể lấy trạng thái tưới nước:", error);
    }finally{
        overlay.style.display = "none"; // Ẩn loading
        document.body.style.pointerEvents = "auto"; // Mở lại thao tác
    }
}

async function toggleWateringStatus(e) {
    const isChecked = e.target.checked;
    if(!cbPumpStatus.checked){
       console.error("Không thể đổi trạng thái vì máy bơm đã tắt:", error);
        return;
    }
    const apiUrl = isChecked ? API_PUMP_WATERING_ON : API_PUMP_WATERING_OFF;

    try {
      overlay.style.display = "flex"; // Hiện loading
      document.body.style.pointerEvents = "none"; // Khóa thao tác
      
      const res = await fetch(apiUrl);
      const text = await res.text();
      console.log("Phản hồi từ ESP32:", text);
      txtPumpStatus.textContent = isChecked ? "Đang bật" : "Đang tắt";
    } catch (error) {
      console.error("Lỗi điều khiển máy bơm:", error);
      cbPumpStatus.checked = !isChecked;
    }finally{
        overlay.style.display = "none"; // Ẩn loading
        document.body.style.pointerEvents = "auto"; // Mở lại thao tác
    }
  }

cbPumpStatus.addEventListener("change", togglePumpStatus);
window.addEventListener("DOMContentLoaded", fetchGetPumpStatus);



const buttonChangeLandArea = document.getElementById("buttonChangeLandArea");
const landAreaForm = document.getElementById("landAreaForm");
const submitLandArea = document.getElementById("submitLandArea");
const inputLandArea = document.getElementById("inputLandArea");
var buttonChangeIsChecked = false;
buttonChangeLandArea.addEventListener("click", () => {
  if(buttonChangeIsChecked){
    buttonChangeLandArea.textContent ="Thay đổi";
    landAreaForm.style.display = "none"; //ẩn form
    buttonChangeIsChecked = false;
  }else{
    buttonChangeLandArea.textContent ="Hủy thay đổi";
    landAreaForm.style.display = "block"; // Hiện form
    buttonChangeIsChecked = true;
  }
 
});

submitLandArea.addEventListener("click", async () => {
  const area = inputLandArea.value.trim();

  if (!area || isNaN(area) || Number(area) <= 0) {
    alert("Vui lòng nhập diện tích hợp lệ!");
    return;
  }

  try {
    const res = await fetch("/api/change-land-area", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ landArea: Number(area) })
    });

    const data = await res.json();
    alert("Cập nhật thành công!");
    landAreaForm.style.display = "none"; // Ẩn form sau khi gửi thành công
    inputLandArea.value = ""; // Reset input
  } catch (err) {
    console.error("Lỗi gửi API:", err);
    alert("Đã xảy ra lỗi khi cập nhật diện tích!");
  }
});