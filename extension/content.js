/* global chrome */

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

    var port = chrome.runtime.connect();

    // Forward message from Nextcloud Spreed app to the extension.
    window.addEventListener('message', function(event) {
        var msg = event.data;
        if (event.source === window && !msg.answer) {
            port.postMessage(msg);
        }
    });

    // Forward message from the extension to the Nextcloud Spreed app.
    port.onMessage.addListener(function(msg) {
        window.postMessage(msg, window.document.URL);
    });

})();
