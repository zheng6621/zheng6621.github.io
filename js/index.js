let curPageIndex = 0;
(function () {
  // 当前显示的页面索引
  let pageContainer = $(".page-container");
  let pageNumber = pageContainer.children.length; // 页面的数量

  // 设置页面容器的margin-top为合适的值
  function toPage () {
    // 让容器包含过渡效果
    pageContainer.style.transition = '500ms';
    // window.innerHeight 窗口的屏幕高度
    // document.documentElement.clientHeight 屏幕高度  document.documentElement是html
    pageContainer.style.marginTop = -curPageIndex * document.documentElement.clientHeight + 'px'
  }
  toPage();

  // 移动端触摸事件
  pageContainer.ontouchstart = function (e) {
    let y = e.changedTouches[0].clientY;
    pageContainer.style.transition = "none";
    // 按下后监听手指移动
    pageContainer.ontouchmove = function (e) {
      let dis = e.changedTouches[0].clientY - y; // 计算距离
      // 计算pageContainer的margintop
      let mtop = -curPageIndex * document.documentElement.clientHeight + dis;
      if (mtop > 0) {
        mtop = 0; // 最大值为0
      } else if (mtop < -(pageNumber - 1) * document.documentElement.clientHeight) {
        // 最小值
        mtop = -(pageNumber - 1) * document.documentElement.clientHeight
      }
      pageContainer.style.marginTop = mtop + 'px';
    };
    
    // 按下后监听手指抬起
    pageContainer.ontouchend = function (e) {
      // 手指抬起后到按下的距离
      let dis = e.changedTouches[0].clientY - y; // 计算距离
      if (Math.abs(dis) <= 30) {
        // 手指移动的不多
        toPage(); // 回到正确的位置
      } else if (dis > 0 && curPageIndex > 0) {
        // 向下移动并且当前不是第一页
        curPageIndex --;
        toPage();
      } else if (dis < 0 && curPageIndex < pageNumber -1) {
        // 向上移动并且当前是最后一页
        curPageIndex ++;
        toPage();
      }
      // 手指抬起后，取消监听移动和抬起
      pageContainer.ontouchmove = null;
      pageContainer.ontouchend = null;
    }
  }
}());

(async function () {
  // 获取前显示loading
  showLoading();
  // 1.获取远程数据
  // (`https://bless.yuanjin.tech/api/bless?id=${location.search.replace('?', '')}`)
  // 'https://bless.yuanjin.tech/api/bless?id=5fe70be490eb6c3c4e8d2128'
  let resp = await fetch('https://bless.yuanjin.tech/api/bless?id=6091728890eb6c3c4e8d264a');
  resp = await resp.json();
  resp = resp.data;
  console.log(resp);

  // 2. 根据远程数据，设置页面中的各种区域
  (function () {
    // 第一页的数据
    $('.page1 .g-btn').innerText = `来自「${resp.author}」的祝福`;
    // 第二页的数据
    let pre = $('.page2 .note pre');
    pre.innerText = resp.content;
    // 看一下内容部分是否有滚动条
    // pre.clientHeight内容区可见高度, pre.scrollHeight内容实际高度
    if (pre.clientHeight != pre.scrollHeight) {
      // 有滚动条
      // 不阻止默认行为
      pre.dataset.default = true;
      // 阻止事件冒泡
      pre.ontouchstart = function (e) {
        e.stopPropagation();
      }
    }
    // 判断是否有录音
    if (resp.audioUrl) {
      // 设置音频
      $('#soundAudio').src = resp.audioUrl;
    } else {
      // 没有录音
      $('.page2 .g-tape').remove();
      $('.page2 .g-btn').remove();
      $('.page2 .note').style.top = '1rem';
    }
    // 设置背景音乐的音频
    $('#bgMusicAudio').src = `../assets/media/${resp.bgMusicIndex}.mp3`;
  } ());

  // 3. 实现摇一摇
  (function () {
    /**
    * 启用摇一摇事件
    * 由于某些手机的限制，该方法必须在某个元素点击后调用
    **/
    async function regShakenEvent(){
      try {
        await utils.regShakenEvent(); // 启用摇一摇
      } catch (err) {
        /* 
        * 不支持devicemotion事件的手机
        * 或
        * 用户不允许监听设备运动
        */
        alert("由于权限问题，无法使用摇一摇功能");
      }
    }

    $('.page3 .g-modal .g-btn').onclick = function () {
      regShakenEvent();
      $('.page3 .g-modal').remove();
    };
    window.addEventListener('shaken', function () {
      showBlessCard();
      console.log('woyaole');
    })

    // 弹出祝福卡片
    function showBlessCard () {
      if (curPageIndex !== 2) {
        // 只有第三页才能弹出卡片
        return;
      }
      // 看之前有没有
      let divModal = $('#divBlessCard');
      if (divModal) {
        // 先关闭
        closeBlessCard();
        // 再打开
        setTimeout(_showBlessCard(), 500);
      } else {
        _showBlessCard();
      }
      function _showBlessCard() {
        let divModal = $$$('div');
        divModal.id = 'divBlessCard'
        divModal.className = 'g-modal';
        divModal.innerHTML = `
        <div class='bless-card'>
          <img src="./assets/bless-card/${Math.floor(Math.random() * 7)}.png" alt="">
          <div class="close">
            <div class="close-btn"></div>
          </div>
        </div> 
        `;
        let blessCard = divModal.querySelector('.bless-card');
        blessCard.style.transition = '500ms';
        document.body.appendChild(divModal);
        blessCard.style.transform = 'scale(0)';
        // 强行让浏览器渲染一次  reflow回流
        blessCard.clientHeight;
        blessCard.style.transform = 'scale(1)';

        // 播放摇一摇音频
        let aud = $('#shakenAudio');
        aud.currentTime = 0; // 播放进度设置为0
        aud.play();

        divModal.dataset.default = true;
        // 点击蒙层关闭
        divModal.onclick = closeBlessCard;
        divModal.querySelector('.close-btn').dataset.default = true;
      }
    }
    // 关闭祝福卡片
    function closeBlessCard () {
      let divModal = $('#divBlessCard');
      if (!divModal) {
        return;// 之前没有弹出
      } else {
        // 1. 先缩小
        let blessCard = divModal.querySelector('.bless-card');
        blessCard.style.transform = 'scale(0)';
        // 2. 关闭
        setTimeout(() => {
          divModal.remove();
        }, 500);
      }
    }
    window.showBlessCard = showBlessCard;
    window.closeBlessCard = closeBlessCard;
  } ())
  // 4. 控制声音
  // 背景音乐
  let bgMusic = {
    audio: $('#bgMusicAudio'),
    isPlayed: false, // 是否播放过
    async play () {
      try {
        await this.audio.play();
        this.isPlayed = true; // 表示已经播放过了
      } catch {
        alert('宁的浏览器不支持自动播放，宁可以点击右上角的按钮试试');
      }
    },
    // 暂停
    pause () {
      this.audio.pause();
    },
    // 设置音量
    setVolume (value) {
      this.audio.volume = value;
    }
  }

  // bgMusic.play();
  // bgMusic.setVolume(0.5)

  // 祝福语音
  let sound = {
    audio: $('#soundAudio'),
    isPlayed: false, //是否播放过
    play () {
      this.audio.play();
      this.isPlayed = true;
      // 设置背景音乐音量小一点
      bgMusic.setVolume(0.3);
      // 播放语音时，有可能顺带播放背景音乐
      if (!bgMusic.isPlayed) {
        bgMusic.play();
      }
    },
    pause () {
      this.audio.pause();
      bgMusic.setVolume(1);
    }
  }
  // sound.play();

  // 将于声音相关的所有元素设置为正确状态
  function setElementStatus () {
    // 设置右上角元素状态
    if (bgMusic.audio.paused) {
      // 音乐暂停添加类样式music-close
      $('.music').classList.add('music-close');
    } else {
      // 音乐正在播放
      $('.music').classList.remove('music-close');
    }
    if (!resp.audioUrl) {
      return;
    }
    // 设置磁带状态
    if (sound.audio.paused) {
      $('.page2 .g-tape').classList.remove('playing');
    } else {
      $('.page2 .g-tape').classList.add('playing');
    }
    // 按钮文字
    let btn = $('.page2 .g-btn');
    if (sound.isPlayed) {
      if (sound.audio.paused) {
        // 当前声音是暂停的
        btn.innerText = '播放';
      } else {
        btn.innerText = '暂停';
      }
    } else {
      // 从来没有播放过语音
      btn.innerText = '播放祝福语音'
    }
  }

  // 点击事件
  bgMusic.play(); // 最开始播放背景音乐
  setElementStatus(); // 设置状态
  $('.music').onclick = function () {
    if (bgMusic.audio.paused) {
      bgMusic.play();
    } else {
      bgMusic.pause();
    }
    setElementStatus();
  }
  if (resp.audioUrl) {
    $('.page2 .g-btn').onclick = function () {
      if (sound.audio.paused) {
        sound.play();
      } else {
        sound.pause();
      }
      setElementStatus();
    }
    sound.audio.onended = function () {
      setElementStatus();
      $('.page2 .g-btn').innerText = '重新播放';
    }
  }
  // 获取后清除loading

  // 我也要送祝福事件
  $('.page3 .g-btn').onclick = function () {
    // 跳转页面
    location.href = `bless.html?${location.search.replace('?', '')}`;
  }
  hideLoading();
} ());