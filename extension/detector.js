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

(function(document) {

	function hasClass(element, cls) {
		return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
	}

	// Only add extension if the page is running the Nextcloud Spreed app.
	var nc = document.getElementById('app');
	if (!nc || !hasClass(nc, 'nc-enable-screensharing-extension')) {
		return;
	}

	var extension = nc.getAttribute('data-chromeExtensionData');
	if (extension) {
		try {
			extension = JSON.parse(extension);
		} catch (e) {
			return;
		}
	}

	console.log('Detected Nextcloud Spreed app.');
	var msg = {
		type: 'init-nc-screensharing',
		data: {
			extension: extension || null
		}
	};

	chrome.runtime.sendMessage(null, msg, null, function(data) {
		console.log('Initialized extension', data);
		nc.setAttribute('data-chromeExtensionData', JSON.stringify(data));
	});

}(document));
