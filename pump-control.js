const DOMAIN_PUMP ="http://10.251.1.103";

const API_GET_PUMP_STATUS = DOMAIN_PUMP + "/pump/control/get-status";
const API_PUMP_CONTROL_ON= DOMAIN_PUMP + "/pump/control/on";    
const API_PUMP_CONTROL_OFF= DOMAIN_PUMP+ "/pump/control/off"; 

const API_GET_WATERING_STATUS = DOMAIN_PUMP + "/pump/watering/get-status";
const API_PUMP_WATERING_ON= DOMAIN_PUMP + "/pump/watering/on";    
const API_PUMP_WATERING_OFF= DOMAIN_PUMP+ "/pump/watering/off"; 

var API_SET_SQUARE_AREA= DOMAIN_PUMP + "/set-square-area"; 

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

      const isOn = status.trim().toUpperCase() === "PUMP_IS_ON";
      cbPumpStatus.checked = isOn;
      txtPumpStatus.textContent = isOn ? "Đang bật" : "Đang tắt";
      cbWateringStatus.disabled = !isOn;
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

      const isOn = status.trim().toLowerCase() === "IS_WATERING";
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
    buttonChangeLandArea.textContent ="Hủy";
    landAreaForm.style.display = "block"; // Hiện form
    buttonChangeIsChecked = true;
  }
 
});

submitLandArea.addEventListener("click", async () => {
  const area = inputLandArea.value.trim();
  const txtLandArea = document.getElementById("txtLandArea");
  if (!area || isNaN(area) || Number(area) <= 0) {
    alert("Vui lòng nhập diện tích hợp lệ!");
    return;
  }

  try {
    const res = await fetch(`${API_SET_SQUARE_AREA}?square=${Number(area)}`, {
      method: "GET"});

    if (!res.ok) {
      throw new Error(`Server trả về mã lỗi: ${res.status}`);
    }
    
    const resultText = await res.text();
    console.log("Phản hồi từ server:", resultText); 
    
    alert("Cập nhật thành công!");
    buttonChangeLandArea.textContent ="Thay đổi";
    buttonChangeIsChecked = false;
    landAreaForm.style.display = "none"; // Ẩn form sau khi gửi thành công
    inputLandArea.value = ""; // Reset input
    txtLandArea.textContent = Number(area);
  } catch (err) {
    console.error("Lỗi gửi API:", err);
    alert("Đã xảy ra lỗi khi cập nhật diện tích!");
  }
});