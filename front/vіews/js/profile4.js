document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logout");
  const content = document.getElementById("content");
  const usernameDisplay = document.getElementById("usernameDisplay");
  const photoInput = document.getElementById("photoInput");
  const userPhoto = document.getElementById("userPhoto");

  // Перевірка аутентифікації (демо)
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return; // Завершуємо функцію, якщо користувач не аутентифікований
  }

  // Демонстрація даних користувача
  const user = {
    username: "Тромпак Юрій",
    photo: "https://via.placeholder.com/150",
  };

  usernameDisplay.textContent = user.username;
  userPhoto.src = user.photo;

  // Обробка події виходу
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }

  // Обробка зміни фото
  if (photoInput) {
    photoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          userPhoto.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Обробка кліків по меню
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelectorAll(".nav-link")
        .forEach((item) => item.classList.remove("active"));
      link.classList.add("active");

      const section = link.getAttribute("data-section");
      loadSection(section);
    });
  });

  function loadSection(section) {
    if (section === "profile") {
      content.innerHTML = `
        <h1>Кабінет користувача</h1>
        <div class="row">
         <div class="pop"></div>
        </div>
        <form id="profile-form">
          <div class="form-group">
            <label for="username">Ім'я користувача</label>
            <input type="text" class="form-control" id="username" value="${user.username}" required>
          </div>
          <div class="form-group">
            <label for="email">Електронна пошта</label>
            <input type="email" class="form-control" id="email" value="trompak03@gmail.com" required>
          </div>
         
        </form>
      `;
    } else if (section === "statistics") {
      content.innerHTML = `
       
        <div>
        <h1>Статистика</h1>
     
        </div>
        <div class="row">
         <div class="pop"></div>
        </div>
        <div class="row">
          <canvas id="myChart" style="width:100%;max-width:600px"></canvas>
          <div class="dates-wrapper">
            <p>Доступні дати до перегляду:</p>
            <div class="list-datest"></div>
          </div>
        </div>
        <table class="productss-table"></table>
      `;
    } else if (section === "history") {
      content.innerHTML = `
        <h1>Календар витрат по дням</h1>
        <div class="row">
         <div class="pop"></div>
        </div>
        <div id="calendar"></div>
      `;
    }
  }

  // Завантаження початкового розділу
  loadSection("profile");

  // Вказуємо шлях до файлу
  const filePath = "data4.xlsx"; // Вкажіть правильний шлях до вашого файлу

  // Завантаження файлу даних
  async function loadData(filePath) {
    try {
      // Завантаження файлу
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      // Отримання масиву байтів
      const arrayBuffer = await response.arrayBuffer();
      const dataObject = {};
      const datesList = {};

      // Обробка даних файлу
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        dataObject[sheetName] = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        let sum = 0;
        dataObject[sheetName].forEach(row => {
          sum += parseFloat(row['Ціна']) || 0;
        });
        datesList[sheetName] = sum.toFixed(2);
      });

      // Збереження даних у глобальних змінних
      window.dataObject = dataObject;
      window.datesList = datesList;

      // Оновлення інтерфейсу
      updateUI(dataObject, datesList);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // Виклик функції для завантаження даних
  loadData(filePath);

  function updateUI(dataObject, datesList) {
    // Оновлення інтерфейсу на основі завантажених даних
    console.log('Data loaded:', dataObject, datesList);
  }
});

$(document).ready(function () {
  let dataObject = {};
  let categoriesObject = {};
  let myLineChart;
  let datesList = {};

  // Обробка вибору файлу вручну
  $("body").on("change", "#data", function () {
    dataObject = {};
    var reader = new FileReader();
    reader.onload = function () {
      datesList = {};
      var arrayBuffer = this.result,
        array = new Uint8Array(arrayBuffer),
        binaryString = String.fromCharCode.apply(null, array);

      var workbook = XLSX.read(binaryString, {
        type: "binary",
      });

      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        dataObject[sheetName] = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        let sum = 0;
        dataObject[sheetName].forEach(row => {
          sum += parseFloat(row['Ціна']) || 0;
        });
        datesList[sheetName] = sum.toFixed(2);
      });

      window.dataObject = dataObject;
    };
    reader.readAsArrayBuffer(this.files[0]);
  });

  $('.nav-link[data-section="statistics"]').on("click", function () {
    const availableDates = Object.keys(window.dataObject);
    const availableDatesList = $('<select class="available-dates-statistics"></select>');

    availableDates.forEach(date => {
      $('<option/>').addClass(date).text(date).attr({ value: date }).appendTo(availableDatesList);
    });

    $(".list-datest").html(availableDatesList);
    $('.available-dates-statistics').trigger('change');
  });

  $("body").on("change", ".available-dates-statistics", function () {
    const currentDate = $(this).val();
    const dataForTable = window.dataObject[currentDate];
    const $table = $(".productss-table").empty();

    categoriesObject = {};
    dataForTable.forEach((row, rowIndex) => {
      const $th = $("<tr>");
      const $tr = $("<tr>");
      Object.keys(row).forEach((key, keyIndex) => {
        if (rowIndex === 0) {
          $th.append($("<th>").text(key));
        }
        $tr.append($("<td>").text(row[key]));
        if (keyIndex === 0) {
          const categoryKey = row[key];
          categoriesObject[categoryKey] = categoriesObject[categoryKey] 
            ? (parseFloat(categoriesObject[categoryKey]) + parseFloat(row['Ціна'])).toFixed(2) 
            : parseFloat(row['Ціна']).toFixed(2);
        }
      });
      $th.appendTo($table);
      $tr.appendTo($table);
    });

    const xValues = Object.keys(categoriesObject);
    const yValues = Object.values(categoriesObject);
    const barColors = xValues.map(() => '#' + Math.floor(Math.random()*16777215).toString(16));

    if (myLineChart) {
      myLineChart.destroy();
    }

    myLineChart = new Chart("myChart", {
      type: "doughnut",
      data: {
        labels: xValues,
        datasets: [
          {
            backgroundColor: barColors,
            data: yValues,
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "Діаграма витрат по категоріям",
        },
      },
    });
  });

  $('.nav-link[data-section="history"]').on("click", function () {
    const eventsObject = {};
    Object.keys(window.datesList).forEach(date => {
      const formattedDate = date.replace(/\-/g, '/');
      eventsObject[formattedDate] = $("<div>Cума витрат: <b>" + window.datesList[date] + " грн.</b> </div>");
    });

    $("#calendar").tempust({
      date: new Date("2024/6/7"),
      offset: 1,
      events: eventsObject
    });
  });
});

function openPopup() {
  document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

function showPhoto(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      const photoArea = document.getElementById('photo-area');
      photoArea.innerHTML = ''; // Очистити область
      photoArea.appendChild(img);
  }

  if (file) {
      reader.readAsDataURL(file);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const openPageButton = document.getElementById("openPageButton");

  // Обробка натискання на кнопку
  openPageButton.addEventListener("click", () => {
      window.location.href = "C:\Users\tromp\Desktop\OCR\front\views\profile.html"; // Замість "secondPage.html" вкажіть шлях до вашої другої сторінки
  });
});


