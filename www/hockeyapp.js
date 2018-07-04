var cordova = require('cordova');
var exec = require('cordova/exec');

function isWindows() {
    return cordova.platformId === 'windows';
}

let properties = {
    appId: null,
};


var hockeyapp = {
    start: function (success, failure, appId, autoSend, checkForUpdateMode, ignoreDefaultHandler, createNewFeedbackThread, loginMode, appSecret) {
        autoSend = (autoSend === true || autoSend === "true");
        ignoreDefaultHandler = (ignoreDefaultHandler === true || ignoreDefaultHandler === "true");
        loginMode = loginMode || hockeyapp.loginMode.ANONYMOUS;
        appSecret = appSecret || '';
        checkForUpdateMode = checkForUpdateMode || hockeyapp.checkForUpdateMode.CHECK_ON_STARTUP;
        createNewFeedbackThread = (createNewFeedbackThread === true || createNewFeedbackThread === "true");

        properties.appId = appId;

        // Requesting loginMode.EMAIL_ONLY without an appSecret is not permitted
        if (loginMode === hockeyapp.loginMode.EMAIL_ONLY && appSecret.trim() === '') {
            if (failure && typeof failure === 'function') {
                failure('You must specify your app secret when using email-only login mode');
            }
            return;
        }

        if (isWindows()) {
            return;
        }

        exec(success, failure, "HockeyApp", "start", [appId, loginMode, appSecret, autoSend, ignoreDefaultHandler, createNewFeedbackThread, checkForUpdateMode]);
    },
    setUserEmail: function (success, failure, userEmail) {
        if (isWindows()) {
            return;
        }

        exec(success, failure, "HockeyApp", "setUserEmail", [userEmail]);
    },
    setUserName: function (success, failure, userName) {
        if (isWindows()) {
            return;
        }

        exec(success, failure, "HockeyApp", "setUserName", [userName]);
    },
    feedback: function (success, failure) {
        if (isWindows()) {
            return;
        }

        exec(success, failure, "HockeyApp", "feedback", []);
    },
    composeFeedback: function (success, failure, attachScreenshot, data) {
        if (isWindows()) {
            return;
        }

        var parameters = [attachScreenshot === true || attachScreenshot === "true"];
        if (data != undefined) {
            parameters.push(JSON.stringify(data));
        }
        exec(success, failure, "HockeyApp", "composeFeedback", parameters);
    },
    sendFeedback: function (data, success, error) {
        try {
            const feedbackUrl = `https://sdk.hockeyapp.net/api/2/apps/${properties.appId}/feedback`;
            let attachmentNumber = 0;
            let addAttachment = (fd, file, name = undefined) => {
                if (attachmentNumber >= 3) {
                    throw new Error('Exceeded a limit of 3 attachments (including log file)!');
                }
                fd.append(`attachment${attachmentNumber}`, file, name);
                attachmentNumber++;
            };

            const fd = new FormData();
            fd.append('email', data.email);
            fd.append('text', data.text); // required
            if (data.logFile) {
                addAttachment(fd, data.logFile.blob, data.logFile.name);
            }
            data.attachments.forEach(file => addAttachment(fd, file));

            fd.append('oem', device.manufacturer);
            fd.append('model', device.model);
            fd.append('os_version', `${device.platform} ${device.version}`);
            fd.append('lang', navigator.language);

            fetch(feedbackUrl, {
                method: 'POST',
                body: fd,
            }).then(success).catch(error);
        } catch (e) {
            error(e);
        }
    },
    forceCrash: function (success, failure) {
        if (isWindows()) {
            return;
        }

        exec(success, failure, "HockeyApp", "forceCrash", []);
    },
    checkForUpdate: function (success, failure) {
        if (isWindows()) {
            return;
        }

        exec(success, failure, "HockeyApp", "checkForUpdate", []);
    },
    addMetaData: function (success, failure, data) {
        if (isWindows()) {
            return;
        }

        exec(success, failure, "HockeyApp", "addMetaData", [data]);
    },
    trackEvent: function (success, failure, eventName) {
        if (isWindows()) {
            return;
        }

        exec(success, failure, "HockeyApp", "trackEvent", [eventName]);
    },

    // Valid loginMode values
    loginMode: {
        ANONYMOUS: 0,
        EMAIL_ONLY: 1,
        EMAIL_PASSWORD: 2,
        VALIDATE: 3
    },

    checkForUpdateMode: {
        CHECK_ON_STARTUP: 0,
        CHECK_MANUALLY: 2
    }
};

module.exports = hockeyapp;
