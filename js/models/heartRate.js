
define({
	name: 'models/heartRate',
	requires: ['core/event', 'core/storage/idb'],
	def: function modelsHeartRate(req) {
		'use strict';

		var indexedDB = req.core.storage.idb,
			event = req.core.event,
			CONTEXT_TYPE = 'HRM',
			STORAGE_IDB_IP = 'ip',
			heartRate = null,
			heartRateData = {},
			webSocketStatus = 'CLOSED';

		function getIp() {
			console.log('got ip')
			indexedDB.get(STORAGE_IDB_IP);
		}

		function setIp(ip) {
			console.log('set ip: ' + ip)
			indexedDB.set(STORAGE_IDB_IP, ip);
		}


		var webSocket;
		function createWebSocket(ip) {
			webSocket = new WebSocket('ws://' + ip);

			webSocket.addEventListener('open', function (e) {
				console.log('con open' + e.target.readyState);
				event.fire('neWwsState', e)
				setWebSocketStatus('OPEN');
			});
			webSocket.addEventListener('close', function (e) {
				console.log('con closed' + e);
				event.fire('neWwsState', e)
				setWebSocketStatus('CLOSED');
			});
			webSocket.addEventListener('error', function (e) {
				console.log('error', e);
				setWebSocketStatus('ERROR');
				event.fire('neWwsState', e)
			});
			webSocket.addEventListener('message', function (e) {
				console.log('server message: ' + e.data);
			});

		}

		function sendDataToWebSocket(hrinfo) {
			if (webSocket.readyState === 1) {
				webSocket.send(hrinfo.heartRate);
			}
		}
		function closeWebSocket() {
			console.log('CLOSE THE DAMN SOCKET NOW!')
			webSocket.close();
		}
		function setWebSocketStatus(status) {
			console.log(status)
			webSocketStatus = status;
		}
		function getWebSocketStatus() {
			return webSocketStatus;
		}


		function setHeartRateData(heartRateInfo) {
			var pData = {
				rate: heartRateInfo.heartRate,
				rrinterval: heartRateInfo.rRInterval
			};

			heartRateData = pData;
			return pData;
		}


		function getData() {
			return heartRateData;
		}

		function resetData() {
			heartRateData = {
				rate: '-',
				rrinterval: '-'
			};
		}


		function handleHeartRateInfo(heartRateInfo) {
			if (getWebSocketStatus() == 'OPEN') { sendDataToWebSocket(heartRateInfo) }
			setHeartRateData(heartRateInfo);
			event.fire('change', getData());
		}

		function start() {
			resetData();
			heartRate.start(CONTEXT_TYPE, function onSuccess(heartRateInfo) {
				handleHeartRateInfo(heartRateInfo);
			}, function onError(error) {
				console.log('error: ', error.message);
			});
		}


		function stop() {
			heartRate.stop(CONTEXT_TYPE);
		}


		function onWriteIp(e) {
			console.log('onWriteIP event is fired', e)
			event.fire('setIp', e);
		}

		function onReadIp(e) {
			console.log('onReadIP event is fired', e)
			event.fire('getIp', e);
		}
		function handleWsStateChange(e) {
			console.log(e)
			event.fire('wsStateChange', e)
		}
		function bindEvents() {
			event.on({
				'core.storage.idb.write': onWriteIp,
				'core.storage.idb.read': onReadIp,
				'models.heartRate.neWwsState': handleWsStateChange
			});
		}


		function init() {
			bindEvents();
			resetData();
			if (indexedDB.isReady()) {
				getIp();
			} else {
				event.listen('core.storage.idb.open', getIp);
			}

			heartRate = (tizen && tizen.humanactivitymonitor)
				|| (window.webapis && window.webapis.motion) || null;
		}

		return {
			init: init,
			start: start,
			stop: stop,
			createWebSocket: createWebSocket,
			closeWebSocket: closeWebSocket,
			getWebSocketStatus: getWebSocketStatus,
			getIp: getIp,
			setIp: setIp,
		};
	}
});
