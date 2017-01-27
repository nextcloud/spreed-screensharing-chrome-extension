/* global chrome, Promise */

/**
 * @author Joachim Bauch <bauch@struktur.de>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

(function() {

    var priority = 100;

    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        switch (msg.type) {
        case 'init-nc-screensharing':
            var data = msg.data;
            var details = chrome.app.getDetails();
            if (data.extension) {
                // Existing extension data. Checking id.
                if (details.id !== data.extension.id) {
                    // Different extension. Check prio.
                    if (data.extension.priority && data.extension.priority >= priority) {
                        // Existing extension has same or higher priority - skip ourselves.
                        console.log('Refusing to initialize as other extension with same or higher priority found.', data.extension);
                        return;
                    } else {
                        console.log('Refusing to initialize as other extension is already initialized', data.extension);
                        return;
                    }
                }
            }
            console.log('Initializing screensharing extension ...', sender.tab.id, data);
            sendResponse({
                id: details.id,
                version: details.version,
                priority: priority
            });
            // Embed our script.
            chrome.tabs.executeScript(sender.tab.id, {
                file: 'content.js',
                runAt: 'document_end'
            });
            break;
        }
    });

    var ExtensionApi = function(port) {
        this.port = port;
    };

    ExtensionApi.prototype.getScreen = function(resolve, reject, msg) {
        var pending = chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], this.port.sender.tab, function(id) {
            var response = {
                'type': 'gotScreen',
                'id': msg.id
            };
            if (chrome.runtime.lastError) {
                response.sourceId = '';
                response.error = chrome.runtime.lastError;
            } else {
                response.sourceId = id;
            }
            resolve(response);
        });
        if (!pending) {
            return;
        }

        return {
            'type': 'getScreenPending',
            'id': msg.id
        };
    };

    ExtensionApi.prototype.call = function(msg) {
        var api = this;
        var promise = new Promise(function(resolve, reject) {
            var f = api[msg.type];
            if (!f) {
                reject('action ' + msg.type + ' not found');
                return;
            }
            var response = f.bind(api)(resolve, reject, msg);
            if (response) {
                response.answer = true;
                api.port.postMessage(response);
            }
        });
        promise.then(function(result) {
            result.answer = true;
            api.port.postMessage(result);
        }, function(err) {
            if (typeof(err) === 'string') {
                err = {
                    'error': err
                };
            }
            api.port.postMessage(err);
        });
    };

    chrome.runtime.onConnect.addListener(function(port) {
        var tab = port.sender.tab;
        var api = new ExtensionApi(port);
        console.log('Extension connected:', tab.id);
        port.onMessage.addListener(function(msg) {
            if (msg.answer) {
                return;
            }

            msg.answer = true;
            api.call(msg);
        });
    });

    // Bootstrap directly after install so pages need not be refreshed.
    chrome.runtime.onInstalled.addListener(function(details) {
        switch (details.reason) {
        case 'install':
        case 'update':
            console.log('Extension updated or installed', details);
            chrome.windows.getAll({populate: true}, function(windows) {
                windows.forEach(function(window) {
                    window.tabs.forEach(function(tab) {
                        if (tab.url.match(/https:\/\//gi)) {
                            chrome.tabs.executeScript(tab.id, {
                                file: 'detector.js',
                                runAt: 'document_end'
                            });
                        }
                    });
                });
            });
        }
    });

})();
