(function () {
    'use strict';

    /**
     * THIS IS ONLY FOR EDUCATIONAL PURPOSES
     * 
     * I'M NOT RESPONSIBLE FOR ANY ILLEGAL USE OF THIS CODE BY OTHERS USERS
     * THIS IS NOT MEANT TO BE USED FOR TRACKING OR ANY ILLEGAL PURPOSES
     * I'M JUST MAKING SOME TESTS AND LEARNING
     * 
     * I'M NOT COLLECTING ANY PERSONAL DATA (FINGERPRINT ONLY)
     * 
     * IF YOU WANT TO USE THIS CODE, YOU MUST ADHERE TO ALL LOCAL LAWS AND REGULATIONS
     */

    /**
     * Collects device fingerprint data and generates a unique ID.
     */
    const Fingerprinter = {

        getScreenResolution: function () {
            return {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth,
                pixelRatio: window.devicePixelRatio || 1
            };
        },

        getOS: function () {
            const userAgent = window.navigator.userAgent;
            let os = "Unknown OS";

            if (userAgent.indexOf("Win") !== -1) os = "Windows";
            if (userAgent.indexOf("Mac") !== -1) os = "MacOS";
            if (userAgent.indexOf("X11") !== -1) os = "UNIX";
            if (userAgent.indexOf("Linux") !== -1) os = "Linux";
            if (userAgent.indexOf("Android") !== -1) os = "Android";
            if (userAgent.indexOf("iOS") !== -1 || userAgent.indexOf("iPhone") !== -1 || userAgent.indexOf("iPad") !== -1) os = "iOS";

            return os;
        },

        getTimezone: function () {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        },

        getLanguage: function () {
            return navigator.language || navigator.userLanguage;
        },

        getHardwareConcurrency: function () {
            return navigator.hardwareConcurrency || 'unknown';
        },

        getDeviceMemory: function () {
            return navigator.deviceMemory || 'unknown';
        },

        getCanvasFingerprint: function () {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 200;
                canvas.height = 50;

                // Text with different styles
                ctx.textBaseline = "top";
                ctx.font = "14px 'Arial'";
                ctx.textBaseline = "alphabetic";
                ctx.fillStyle = "#f60";
                ctx.fillRect(125, 1, 62, 20);
                ctx.fillStyle = "#069";
                ctx.fillText("Hello World", 2, 15);
                ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
                ctx.fillText("Hello World", 4, 17);

                return canvas.toDataURL();
            } catch (e) {
                return 'canvas-error';
            }
        },

        // Simple font detection (checking width of text with different fonts)
        getInstalledFonts: function () {
            const baseFonts = ['monospace', 'sans-serif', 'serif'];
            const fontList = [
                'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
                'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact',
                'Tahoma', 'Geneva', 'Helvetica', 'Lucida Grande', 'Segoe UI',
                'Roboto', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans'
            ];

            const testString = "mmmmmmmmmmlli";
            const testSize = "72px";
            const h = document.getElementsByTagName("body")[0];

            // Create a span to measure width
            const createSpan = (fontFamily) => {
                const s = document.createElement("span");
                s.style.fontSize = testSize;
                s.style.fontFamily = fontFamily;
                s.style.visibility = "hidden";
                s.innerHTML = testString;
                h.appendChild(s);
                return s;
            };

            const baseWidths = {};
            for (const baseFont of baseFonts) {
                const s = createSpan(baseFont);
                baseWidths[baseFont] = s.offsetWidth;
                h.removeChild(s);
            }

            const detectedFonts = [];
            for (const font of fontList) {
                let detected = false;
                for (const baseFont of baseFonts) {
                    const s = createSpan(`'${font}', ${baseFont}`);
                    const width = s.offsetWidth;
                    h.removeChild(s);
                    if (width !== baseWidths[baseFont]) {
                        detected = true;
                        break;
                    }
                }
                if (detected) detectedFonts.push(font);
            }
            return detectedFonts;
        },

        getBatteryLevel: async function () {
            if (navigator.getBattery) {
                try {
                    const battery = await navigator.getBattery();
                    return {
                        level: battery.level,
                        charging: battery.charging
                    };
                } catch (e) {
                    return 'battery-api-error';
                }
            }
            return 'battery-api-not-supported';
        },

        // Simple hash function (DJB2 or similar can be used, here using SHA-256 via Web Crypto API if available, else simple hash)
        hashString: async function (str) {
            if (crypto && crypto.subtle && crypto.subtle.digest) {
                const msgBuffer = new TextEncoder().encode(str);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } else {
                // Fallback simple hash for older browsers
                let hash = 0, i, chr;
                if (str.length === 0) return hash;
                for (i = 0; i < str.length; i++) {
                    chr = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + chr;
                    hash |= 0; // Convert to 32bit integer
                }
                return hash.toString();
            }
        },

        generate: async function () {
            const components = {
                resolution: this.getScreenResolution(),
                os: this.getOS(),
                timezone: this.getTimezone(),
                language: this.getLanguage(),
                hardwareConcurrency: this.getHardwareConcurrency(),
                deviceMemory: this.getDeviceMemory(),
                canvas: this.getCanvasFingerprint(),
                fonts: this.getInstalledFonts(),
                // Battery is excluded from hash generation as it changes frequently
            };

            // Stable stringify for consistent hashing
            const fingerprintString = JSON.stringify(components);

            const uniqueId = await this.hashString(fingerprintString);

            // Get battery info separately (dynamic)
            const battery = await this.getBatteryLevel();

            return {
                id: uniqueId,
                components: components,
                dynamic: {
                    battery: battery,
                    timestamp: new Date().toISOString()
                }
            };
        },

        sendToAnalytics: function (data) {
            if (typeof gtag === 'function') {
                gtag('event', 'fingerprint_generated', {
                    'event_category': 'Security',
                    'event_label': 'Device Fingerprint',
                    'fingerprint_id': data.id,
                    'screen_resolution': `${data.components.resolution.width}x${data.components.resolution.height}`,
                    'os': data.components.os,
                    'battery_level': data.dynamic.battery.level
                });
            } else {
                console.warn("Google Analytics not initialized");
            }
        }
    };

    // Execute
    // Improved waiting for DOM to be ready for font detection
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    async function init() {
        try {
            const fingerprintData = await Fingerprinter.generate();
            Fingerprinter.sendToAnalytics(fingerprintData);

            // Expose to window for debugging or other scripts
            window.visitorFingerprint = fingerprintData;
        } catch (e) {
            console.error("Fingerprinting failed:", e);
        }
    }

})();
