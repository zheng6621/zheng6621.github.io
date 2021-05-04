function $ (selector) {
  return document.querySelector(selector);
}

function $$ (selector) {
  return document.querySelectorAll(selector);
}

function $$$ (tarName) {
  return document.createElement(tarName);
}

// 阻止 touchstart 事件的默认行为
document.body.addEventListener(
  "touchstart",
  function (e) {
    if (e.target.dataset.default) {
      return;
    }
    if (e.cancelable) {
      e.preventDefault();
    }
  },
  { passive: false }
);

// 阻止 touchmove 事件的默认行为
document.body.addEventListener(
  "touchmove",
  function (e) {
    if (e.target.dataset.default) {
      return;
    }
    if (e.cancelable) {
      e.preventDefault();
    }
  },
  { passive: false }
);

function showLoading () {
  // 先看之前有没有lodingdiv
  let divModal = $('#loadingModal');
  if (divModal) {
    return;
  }
  divModal = $$$('div');
  divModal.id = 'loadingModal';
  divModal.className = 'g-modal';
  divModal.innerHTML = `
  <div class="g-loading">
    <img src="./assets/loading.svg" alt="">
  </div>`;  
  document.body.appendChild(divModal);
}

function hideLoading () {
  let divModal = $('#loadingModal');
  if (divModal) {
    divModal.remove();
  }
}
