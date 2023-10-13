document.addEventListener('DOMContentLoaded', () => {
  let scale_factor_w = NaN;
  let scale_factor_h = NaN;
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  let drawing = false;
  let selectedTool = 'brush-tool';
  let brushSize = 5;
  let currentColor = '#000000';
  let history = [];
  let historyIndex = -1;
  const colorHistory = [currentColor];
  const maxColorHistory = 6;

  context.lineJoin = 'round';
  context.lineCap = 'round';

  const colorChangerInput = document.getElementById('color-changer-input')
  //https://aiplshn.github.io/webapp_telegram/index.html?ngrok_path=https://9941-109-252-32-191.ngrok-free.app&id=655735809#tgWebAppData=query_id%3DAAEBvBUnAAAAAAG8FSfLij1e%26user%3D%257B%2522id%2522%253A655735809%252C%2522first_name%2522%253A%2522%25D0%2590%25D0%25BB%25D0%25B5%25D0%25BA%25D1%2581%25D0%25B0%25D0%25BD%25D0%25B4%25D1%2580%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522username%2522%253A%2522aplshn%2522%252C%2522language_code%2522%253A%2522ru%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26auth_date%3D1696611587%26hash%3Dcea8c783a28095b087abd4d52907bc7e33f770896cca17a45722d5a0f57fb1c7&tgWebAppVersion=6.9&tgWebAppPlatform=tdesktop&tgWebAppThemeParams=%7B"bg_color"%3A"%2317212b"%2C"button_color"%3A"%235288c1"%2C"button_text_color"%3A"%23ffffff"%2C"hint_color"%3A"%23708499"%2C"link_color"%3A"%236ab3f3"%2C"secondary_bg_color"%3A"%23232e3c"%2C"text_color"%3A"%23f5f5f5"%7D
  //https://aiplshn.github.io/webapp_telegram/index.html?ngrok_path=https://9941-109-252-32-191.ngrok-free.app&id=655735809&width=523&height=512#tgWebAppData=query_id%3DAAEBvBUnAAAAAAG8FSfLij1e%26user%3D%257B%2522id%2522%253A655735809%252C%2522first_name%2522%253A%2522%25D0%2590%25D0%25BB%25D0%25B5%25D0%25BA%25D1%2581%25D0%25B0%25D0%25BD%25D0%25B4%25D1%2580%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522username%2522%253A%2522aplshn%2522%252C%2522language_code%2522%253A%2522ru%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26auth_date%3D1696611587%26hash%3Dcea8c783a28095b087abd4d52907bc7e33f770896cca17a45722d5a0f57fb1c7&tgWebAppVersion=6.9&tgWebAppPlatform=tdesktop&tgWebAppThemeParams=%7B"bg_color"%3A"%2317212b"%2C"button_color"%3A"%235288c1"%2C"button_text_color"%3A"%23ffffff"%2C"hint_color"%3A"%23708499"%2C"link_color"%3A"%236ab3f3"%2C"secondary_bg_color"%3A"%23232e3c"%2C"text_color"%3A"%23f5f5f5"%7D
  //file:///C:/Projects/SD_TG_BOT_WH/sketch/index.html?ngrok_path=https://9941-109-252-32-191.ngrok-free.app&id=655735809&width_key=1&height_key=1&width=512&height=512#tgWebAppData=query_id%3DAAEBvBUnAAAAAAG8FSfLij1e%26user%3D%257B%2522id%2522%253A655735809%252C%2522first_name%2522%253A%2522%25D0%2590%25D0%25BB%25D0%25B5%25D0%25BA%25D1%2581%25D0%25B0%25D0%25BD%25D0%25B4%25D1%2580%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522username%2522%253A%2522aplshn%2522%252C%2522language_code%2522%253A%2522ru%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26auth_date%3D1696611587%26hash%3Dcea8c783a28095b087abd4d52907bc7e33f770896cca17a45722d5a0f57fb1c7&tgWebAppVersion=6.9&tgWebAppPlatform=tdesktop&tgWebAppThemeParams=%7B"bg_color"%3A"%2317212b"%2C"button_color"%3A"%235288c1"%2C"button_text_color"%3A"%23ffffff"%2C"hint_color"%3A"%23708499"%2C"link_color"%3A"%236ab3f3"%2C"secondary_bg_color"%3A"%23232e3c"%2C"text_color"%3A"%23f5f5f5"%7D
  let TG = window.Telegram.WebApp;
  var from_tg = NaN;
  TG.expand();
  var currentUrl = window.location.href; // Получаем текущий URL страницы
  var urlParts = currentUrl.split('?');
  var params = {};
  if (urlParts.length > 1) { // Проверяем, есть ли параметры
    var queryParams = urlParts[1];
    var paramPairs = queryParams.split('#')[0];
    paramPairs = paramPairs.split('&');

    // Перебираем пары ключ-значение и добавляем их в объект JSON
    paramPairs.forEach(function(pair) {
      var keyValue = pair.split('=');
      var key = decodeURIComponent(keyValue[0]);
      var value = decodeURIComponent(keyValue[1]);
      params[key] = value;
    });

    // Создаем объект JSON с параметрами
    from_tg = { data: params };
  }

  function initialize() {
    setupTools();
    setupEventListeners();
    renderColorHistory();
    setupColorChangerTool();
    resizeCanvas(NaN);
    clearDrawing();
    history.push(context.getImageData(0, 0, canvas.width, canvas.height));
    historyIndex++;
  }


  function isLightColor(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128;
  }

  function getX(event) {
    if (event.type.includes('touch')) {
      return (event.touches[0].clientX - canvas.getBoundingClientRect().left) * scale_factor_w;
    } else {
      return (event.clientX - canvas.getBoundingClientRect().left) * scale_factor_w;
    }
  }
  function getY(event) {
    if (event.type.includes('touch')) {
      return (event.touches[0].clientY - canvas.getBoundingClientRect().top) * scale_factor_h;
    } else {
      return (event.clientY - canvas.getBoundingClientRect().top) * scale_factor_h;
    }
  }


  function setupColorChangerTool() {
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
      const colorChangerButton = document.getElementById('color-changer-tool');
      colorChangerButton.style.display = 'none';
      colorChangerInput.style.display = 'block';
    }
    const colorChangerTool = document.getElementById('color-changer-tool');
    colorChangerTool.addEventListener('click', () => {
      selectedTool = "brush-tool";
      activateColorChangerTool();
      toggleTool('brush-tool')
    });

    colorChangerInput.addEventListener('input', handleColorChangerInputChange);
  }

  function activateColorChangerTool() {
    canvas.style.cursor = 'crosshair';
    colorChangerInput.click();
  }

  function handleColorChangerInputChange(e) {
    const newColor = e.target.value;
    setColor(newColor);
  }


  function setupTools() {
    const tools = document.querySelectorAll('.tool');
    tools.forEach(tool => {
      tool.addEventListener('click', () => {
        const toolId = tool.id;
        if (toolId !== selectedTool) {
          if (toolId === 'color-picker-tool') {
            activateColorPickerTool();
          } else {
            deactivateColorPickerTool();
          }
          selectedTool = toolId;
          toggleTool(toolId);
        }
      });
    });
  }

  function setupEventListeners() {
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: true });
    canvas.addEventListener('touchend', stopDrawing);


    if (!('ontouchstart' in window || navigator.maxTouchPoints)) {
      colorChangerInput.addEventListener('change', (e) => {
        e.stopPropagation();
        updateColorHistory(currentColor);
      });
    }

    const clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', clearDrawing);

    const undoButton = document.getElementById('undo-tool');
    undoButton.addEventListener('click', undo);

    const redoButton = document.getElementById('redo-tool');
    redoButton.addEventListener('click', redo);

    const brushSlider = document.getElementById('brush-slider');
    brushSlider.addEventListener('input', () => {
      setBrushSize(brushSlider.value);
    });


    const uploadInput = document.getElementById('upload-input');
    uploadInput.addEventListener('change', handleFileUpload);

    // const uploadButton = document.getElementById('upload-button');
    // uploadButton.addEventListener('click', (e) => {
      // e.stopPropagation();
      // uploadInput.click();
    // });

    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', saveCanvasImage);

    const fillCanvasTool = document.getElementById('fill-canvas-tool');
    fillCanvasTool.addEventListener('click', () => {
      fillCanvas();
    });

    // const colorHistoryTool = document.getElementById('color-history-tool');
    // colorHistoryTool.addEventListener('click', () => {
      // toggleColorHistory();
    // });
  }

  function resizeCanvas(e) {
    let width_format = parseInt(from_tg.data['width_key']);
    let height_format = parseInt(from_tg.data['height_key']);
    let canvas_width = parseInt(from_tg.data['width']);
    let canvas_height = parseInt(from_tg.data['height']);
    let view_width = 0;
    let view_height = 0;
    const canvasContainer = document.querySelector('.canvas-container');
    view_height = height_format * canvasContainer.offsetWidth / width_format;
    view_width = width_format * view_height / height_format;
    canvas.height = canvas_height;
    canvas.width = canvas_width;
    canvas.style.height = view_height + 'px';
    canvas.style.width = view_width + 'px';
    clearDrawing();
    scale_factor_w = canvas.width / parseInt(canvas.style.width);
    scale_factor_h = canvas.height / parseInt(canvas.style.height);
  }

  function startDrawing(e) {
    e.preventDefault();
    drawing = true;
    context.beginPath();
    context.moveTo(getX(e), getY(e));
  }

  function draw(e) {
    if (!drawing) return;

    if (selectedTool !== 'color-picker-tool') {
      context.lineWidth = brushSize;
      context.strokeStyle = selectedTool === 'brush-tool' ? currentColor : '#fff';

      context.lineTo(getX(e), getY(e));
      context.stroke();

      if (historyIndex < history.length - 1) {
        history.splice(historyIndex + 1);
      }
    }
  }

  function stopDrawing(e) {
    e.preventDefault();
    if (drawing) {
      context.closePath();
      drawing = false;
      saveCanvasState();
    }
  }

  function clearDrawing() {
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
    colorHistory.length = 0;
    deactivateColorPickerTool();
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      restoreCanvasState(history[historyIndex]);
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      restoreCanvasState(history[historyIndex]);
    }
  }

  function setColor(newColor) {
    currentColor = newColor;
    updateCurrentColorDisplay(currentColor);
  }

  function setBrushSize(size) {
    brushSize = size;
  }

  function fillCanvas() {
    context.fillStyle = currentColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();

    selectedTool = 'brush-tool';
    toggleTool(selectedTool);
  }


  function saveCanvasState() {
    history.push(context.getImageData(0, 0, canvas.width, canvas.height));
    historyIndex++;
  }

  function toggleColorHistory() {
    const colorHistoryContainer = document.querySelector('.color-history');
    colorHistoryContainer.classList.toggle('active');
  }

  function restoreCanvasState(state) {
    context.putImageData(state, 0, 0);
  }

  function updateColorHistory(color) {
    if (!colorHistory.includes(color)) {
      if (colorHistory.length >= maxColorHistory) {
        colorHistory.shift();
      }
      colorHistory.push(color);
      renderColorHistory();
    }
  }


  function updateCurrentColorDisplay(color) {
    const currentColorDisplay = document.getElementById('current-color-display');
    currentColorDisplay.textContent = `текущий цвет: ${color}`;

    if ('ontouchstart' in window || navigator.maxTouchPoints) {
      const saveColorButton = document.createElement('button');
      saveColorButton.textContent = 'сохранить цвет';

      saveColorButton.addEventListener('click', () => {
        updateColorHistory(color);
      });

      currentColorDisplay.appendChild(saveColorButton);
    }
  }



  function setupColorPickerTool() {
    const colorPickerTool = document.getElementById('color-picker-tool');
    colorPickerTool.addEventListener('click', () => {
      activateColorPickerTool();
    });
  }

  function activateColorPickerTool() {
    selectedTool = 'color-picker-tool';
    canvas.style.cursor = 'crosshair';
    canvas.addEventListener('click', handlePicker, { once: true });
    canvas.addEventListener('touchstart', handlePicker, { once: true, passive: true });
  }


  const handlePicker = (e) => {
    const mouseX = e.clientX || e.touches[0].clientX;
    const mouseY = e.clientY || e.touches[0].clientY;

    const pixel = getPixelColorFromCoordinates(canvas, mouseX - canvas.getBoundingClientRect().left, mouseY - canvas.getBoundingClientRect().top);
    if (pixel) {
      const colorCode = rgbToHex(pixel.r, pixel.g, pixel.b);
      currentColor = colorCode;
      updateCurrentColorDisplay(currentColor);
      updateColorHistory(currentColor);
      deactivateColorPickerTool();
      selectedTool = 'brush-tool';
      toggleTool('brush-tool');
    }
  };

  function deactivateColorPickerTool() {
    canvas.style.cursor = 'crosshair';
  }

  function saveCanvasImage() {
  const url = canvas.toDataURL('image/png');

  var formData = new FormData();
  formData.append('id', from_tg.data['id']);
  formData.append('image', url);
  formData.append('width_key', from_tg.data['width_key']);
  formData.append('height_key', from_tg.data['height_key']);

  // Выполните POST-запрос на сервер
  fetch(from_tg.data['ngrok_path']+'/api/upload', {
    method: 'POST',
    headers: {},
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      console.log('Ответ от сервера:', data);
      TG.close();
    })
    .catch(error => {
      console.error('Ошибка при отправке запроса:', error);
      let err_block = document.getElementById('error_message')
      err_block.textContent = "Ошибка";
    });
  }



  function handleFileUpload(event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const image = new Image();
        image.src = e.target.result;

        image.onload = () => {
          const maxSide = Math.max(image.width, image.height);
          const scaleFactor = Math.min(canvas.width / maxSide, canvas.height / maxSide);
          const newWidth = image.width * scaleFactor;
          const newHeight = image.height * scaleFactor;

          clearDrawing();
          context.drawImage(image, 0, 0, newWidth, newHeight);
          saveCanvasState();
        };
      };

      reader.readAsDataURL(file);
    }
  }


  function toggleTool(toolId) {
    const tools = document.querySelectorAll('.tool');
    tools.forEach(tool => {
      tool.classList.remove('active');
    });
    const selectedToolElement = document.getElementById(toolId);
    if (selectedToolElement) {
      selectedToolElement.classList.add('active');
    }
  }

  function renderColorHistory() {
    const colorHistoryContainer = document.querySelector('.color-history-container');
    colorHistoryContainer.innerHTML = '';

    colorHistory.forEach((color) => {
      const colorButton = document.createElement('button');
      colorButton.classList.add('ch-button');
      colorButton.style.backgroundColor = color;
      colorButton.innerHTML = color;
      colorButton.style.color = isLightColor(color) ? '#333' : '#fff';
      colorButton.addEventListener('click', () => {
        setColor(color);
      });
      colorHistoryContainer.appendChild(colorButton);
    });
  }

  function initializeCanvas() {
    const canvas = document.getElementById('canvas');
    const canvasContainer = document.querySelector('.canvas-container');
    canvas.width = canvasContainer.offsetWidth * 0.99;
    canvas.height = canvasContainer.offsetHeight * 0.98;
  }

  function initializeToolEventListeners() {
    const tools = document.querySelectorAll('.tool');
    tools.forEach((tool) => {
      tool.addEventListener('click', () => {
        const toolId = tool.id;
        selectedTool = toolId.replace('-tool', '');
        toggleTool(toolId);
      });
    });
  }

  function initializeBrushSlider() {
    const brushSlider = document.getElementById('brush-slider');
    brushSlider.addEventListener('input', () => {
      setBrushSize(brushSlider.value);
    });
  }

  function initializeUndoRedoButtons() {
    const undoButton = document.getElementById('undo-tool');
    undoButton.addEventListener('click', undo);

    const redoButton = document.getElementById('redo-tool');
    redoButton.addEventListener('click', redo);
  }

  function initializeClearSaveButtons() {
    const clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', clearDrawing);

    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', function(e) {
      e.stopPropagation()
      saveCanvasImage();
    });
  }

  function initializeColorHistoryPicker() {
    const colorHistoryTool = document.getElementById('color-history-tool');
    colorHistoryTool.addEventListener('click', () => {
      const colorHistoryContainer = document.querySelector('.color-history');
      colorHistoryContainer.classList.toggle('active');
    });

    const colorPicker = document.getElementById('color-picker');
    colorPicker.addEventListener('input', (e) => {
      setColor(e.target.value);
    });
  }

  function initializeApp() {
    initializeCanvas();
    initializeToolEventListeners();
    initializeBrushSlider();
    setupColorPickerTool();
    initializeUndoRedoButtons();
    initializeClearSaveButtons();
    initializeColorHistoryPicker();
    history.push(context.getImageData(0, 0, canvas.width, canvas.height));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
  });


  function getPixelColorFromCoordinates(canvas, x, y) {
    const ctx = canvas.getContext('2d');
    const pixelData = ctx.getImageData(x, y, 1, 1).data;

    return {
      r: pixelData[0],
      g: pixelData[1],
      b: pixelData[2]
    };
  }

  function rgbToHex(r, g, b) {
    const componentToHex = (component) => {
      const hex = component.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    const redHex = componentToHex(r);
    const greenHex = componentToHex(g);
    const blueHex = componentToHex(b);

    return `#${redHex}${greenHex}${blueHex}`;
  }


  initialize();
});
