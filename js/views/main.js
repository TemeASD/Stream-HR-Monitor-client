define({
	name: 'views/main',
	requires: ['core/event', 'models/heartRate'],
	def: function viewsPageMain(req) {
		'use strict';

		var event = req.core.event,

			heartRate = req.models.heartRate,

			INFO_SETTIMEOUT_DELAY = 10000,

			INFO_SHOW_DELAY = 10000, webSocketStatusEl = null,

			settingsHeartrateValue = null,

			settingsPopup = null,

			okPopupBtn = null,

			HRLimit = 210,

			currentRate = 0,

			page = null,

			infoBackBtn = null,

			measuringText = null,

			infoTimeoutEnd = 0,

			infoTimeout = 0, stopButton, startButton, errorBackBtn, uiTitleEl, conStatusEl, settingsIpValue, webSocket, ip = '192.168.1.3';

		function hideMeasuringInfo() {
			tau.changePage('#main');
			infoTimeoutEnd = 0;
		}


		function showMeasuringInfo() {
			infoTimeout = 0;

			if (!settingsPopup.classList.contains('ui-popup-active')) {
				tau.changePage('#info');
				infoTimeoutEnd = window.setTimeout(hideMeasuringInfo,
					INFO_SHOW_DELAY);
			}
		}


		function onHeartRateDataChange(heartRateInfo) {
			var rate = heartRateInfo.detail.rate, activePage = document
				.getElementsByClassName('ui-page-active')[0], activePageId = activePage ? activePage.id
					: '';

			if (rate < 1) {
				rate = 0;

				if (activePageId === 'main' && infoTimeout === 0) {
					infoTimeout = window.setTimeout(showMeasuringInfo,
						INFO_SETTIMEOUT_DELAY);
				}
			} else {
				window.clearTimeout(infoTimeout);
				window.clearTimeout(infoTimeoutEnd);
				infoTimeout = 0;
				infoTimeoutEnd = 0;

				if (activePageId === 'info') {
					tau.changePage('#main');
				}
			}

			currentRate = rate;
		}


		function onOkPopupBtnClick() {
			ip = settingsIpValue.value;
			heartRate.setIp(ip);
		}

		function onGetIp(e) {
			console.log(e)
			console.log(e.detail.detail.value);
			let ipIdb = e.detail.detail.value;
			if (ipIdb === undefined) {
				ipIdb = ip;
			}

			settingsIpValue.value = ipIdb;
			ip = ipIdb;
			console.log('ip in event: ', ip, 'ip in settings element: ', settingsIpValue.value)
		}
		function onSetIp() {
			heartRate.getIp();
		}
		function onInfoBackBtnClick() {
			window.clearTimeout(infoTimeoutEnd);
			infoTimeoutEnd = 0;
			tau.changePage('#main');
		}
		function onErrorBackBtnClick() {
			tau.changePage('#main');
		}
		function startButtonClick() {
			if (ip != undefined) {
				heartRate.createWebSocket(ip);
				startButton.setAttribute('disabled', 'disabled');
				stopButton.removeAttribute('disabled');
				conStatusEl.innerHTML = 'LOADING';
				conStatusEl.classList.add("loading")
			} else { conStatusEl.innerHTML = 'SET IP IN SETTINGS' }
		}
		function stopButtonClick() {
			heartRate.closeWebSocket()
			startButton.removeAttribute('disabled')
			stopButton.setAttribute('disabled', 'disabled');
			conStatusEl.innerHTML = 'LOADING';
			conStatusEl.classList.add("loading")
		}
		function onSettingsPopupBeforeShow() {
			heartRate.getIp();
		}
		function wsState(e) {
			console.log('handle wsState', e)
			conStatusEl.classList.remove("connected", "error", "closed", "loading");
			switch (e.detail.detail.type) {
				case 'open':
					conStatusEl.innerHTML = 'CONNECTED';
					conStatusEl.classList.add("connected")
					break;
				case 'error':
					console.log('we should be here')
					conStatusEl.innerHTML = 'ERROR';
					conStatusEl.classList.add("error")
					tau.changePage('#error');
					break;
				case 'close':
					conStatusEl.innerHTML = 'CLOSED';
					conStatusEl.classList.add("closed")
					break;
				default:
					conStatusEl.innerHTML = 'SOMETHING WACKY'
			}
		}

		function bindEvents() {
			page = document.getElementById('main');
			measuringText = document.getElementById('measuring-info');
			errorBackBtn = document.getElementById('error-back-btn')
			settingsPopup = document.getElementById('settings-popup');
			okPopupBtn = document.getElementById('ok-popup-btn');
			webSocketStatusEl = document.getElementById('websocketstatus');
			infoBackBtn = document.getElementById('info-back-btn');
			startButton = document.getElementById('hr-mon-start');
			stopButton = document.getElementById('hr-mon-stop');
			uiTitleEl = document.getElementById('ui-title');
			conStatusEl = document.getElementById('conStatus');
			settingsIpValue = document.getElementById('ip-text-input');
			okPopupBtn.addEventListener('click', onOkPopupBtnClick);
			settingsPopup.addEventListener('popupbeforeshow',
				onSettingsPopupBeforeShow);
			errorBackBtn.addEventListener('click', onErrorBackBtnClick);
			stopButton.addEventListener('click', stopButtonClick);
			startButton.addEventListener('click', startButtonClick);
			okPopupBtn.addEventListener('click', onOkPopupBtnClick);
			infoBackBtn.addEventListener('click', onInfoBackBtnClick);
			event.on({
				'models.heartRate.change': onHeartRateDataChange,
				'models.heartRate.setIp': onSetIp,
				'models.heartRate.getIp': onGetIp,
				'models.heartRate.wsStateChange': wsState
			});
		}


		function init() {
			heartRate.start();
			bindEvents();
		}

		return {
			init: init,
		};
	},
});
