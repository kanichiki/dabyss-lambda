"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomBoolean = exports.getRandomNumber = exports.getRandomIndexes = exports.chooseRandomIndexes = exports.getRemainingTime = exports.getEndTime = exports.getTimerObject = exports.convertIntervalToTimerString = exports.convertIntervalToString = exports.getCurrentTime = exports.convertDateToString = exports.calculateMaxNumberLessThanHalf = exports.makeShuffuleNumberArray = void 0;
exports.makeShuffuleNumberArray = (number) => __awaiter(void 0, void 0, void 0, function* () {
    let shuffleNumbers = [];
    LOOP: for (let i = 0; i < number; i++) {
        while (true) {
            const num = Math.floor(Math.random() * number);
            let status = true;
            for (const shuffleNumber of shuffleNumbers) {
                if (shuffleNumber == num) {
                    status = false;
                }
            }
            if (status) {
                shuffleNumbers.push(num);
                continue LOOP;
            }
        }
    }
    return shuffleNumbers;
});
exports.calculateMaxNumberLessThanHalf = (number) => __awaiter(void 0, void 0, void 0, function* () {
    let res = 0;
    if (number % 2 == 0) {
        res = number / 2 - 1;
    }
    else {
        res = number / 2;
    }
    return res;
});
exports.convertDateToString = (date) => __awaiter(void 0, void 0, void 0, function* () {
    const year = date.getFullYear();
    const yearString = year.toString();
    const month = date.getMonth() + 1; // 1月は0らしい
    let monthString = month.toString();
    if (month < 10) {
        monthString = "0" + monthString;
    }
    const day = date.getDate();
    let dayString = day.toString();
    if (day < 10) {
        dayString = "0" + dayString;
    }
    const hours = date.getHours();
    let hoursString = hours.toString();
    if (hours < 10) {
        hoursString = "0" + hoursString;
    }
    const minutes = date.getMinutes();
    let minutesString = minutes.toString();
    if (minutes < 10) {
        minutesString = "0" + minutesString;
    }
    const second = date.getSeconds();
    let secondString = second.toString();
    if (second < 10) {
        secondString = "0" + secondString;
    }
    return yearString + "-" + monthString + "-" + dayString + " " + hoursString + ":" + minutesString + ":" + secondString;
});
exports.getCurrentTime = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentTime = new Date();
    const currentTimeString = yield exports.convertDateToString(currentTime);
    return currentTimeString;
});
exports.convertIntervalToString = (interval) => __awaiter(void 0, void 0, void 0, function* () {
    let hoursString = interval.hours.toString();
    if (interval.hours < 10) {
        hoursString = "0" + hoursString;
    }
    let minutesString = interval.minutes.toString();
    if (interval.minutes < 10) {
        minutesString = "0" + minutesString;
    }
    let secondsString = interval.seconds.toString();
    if (interval.seconds < 10) {
        secondsString = "0" + secondsString;
    }
    const timeString = hoursString + ":" + minutesString + ":" + secondsString;
    return timeString;
});
exports.convertIntervalToTimerString = (interval) => __awaiter(void 0, void 0, void 0, function* () {
    let timerString = "";
    if (interval.hours != 0) {
        timerString += interval.hours.toString() + "時間";
    }
    if (interval.minutes != 0) {
        timerString += interval.minutes.toString() + "分";
    }
    if (interval.seconds != 0) {
        timerString += interval.seconds.toString() + "秒";
    }
    return timerString;
});
exports.getTimerObject = (timerString) => __awaiter(void 0, void 0, void 0, function* () {
    const timerArray = timerString.split(":");
    const timerObject = {
        hours: Number(timerArray[0]),
        minutes: Number(timerArray[1]),
        seconds: Number(timerArray[2])
    };
    return timerObject;
});
exports.getEndTime = (startTimeString, timerString) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = new Date(startTimeString);
    let endTime = startTime;
    const timer = yield exports.getTimerObject(timerString);
    endTime.setHours(endTime.getHours() + timer.hours);
    endTime.setMinutes(endTime.getMinutes() + timer.minutes);
    endTime.setSeconds(endTime.getSeconds() + timer.seconds);
    const endTimeString = yield exports.convertDateToString(endTime);
    return endTimeString;
});
exports.getRemainingTime = (endTimeString) => __awaiter(void 0, void 0, void 0, function* () {
    const currentTime = new Date();
    const endTime = new Date(endTimeString);
    let diff = endTime.getTime() - currentTime.getTime();
    console.log(diff);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff = diff % (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff = diff % (1000 * 60);
    const seconds = Math.floor(diff / 1000);
    const remainingTime = {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
    return remainingTime;
});
/**
 * 与えられたuserNumberの数の中からchooseNumberの数だけランダムに選んでその配列を返す
 *
 * @param {*} userNumber
 * @param {*} chooseNumber
 * @returns
 */
exports.chooseRandomIndexes = (userNumber, chooseNumber) => __awaiter(void 0, void 0, void 0, function* () {
    let randomIndexes = [];
    LOOP: for (let i = 0; i < chooseNumber; i++) {
        while (true) {
            const num = Math.floor(Math.random() * userNumber);
            let status = true;
            for (const randomIndex of randomIndexes) {
                if (randomIndex == num) {
                    status = false;
                }
            }
            if (status) {
                randomIndexes.push(num);
                continue LOOP;
            }
        }
    }
    return randomIndexes;
});
/**
 * 与えられたインデックスの中からchooseNumberの数だけランダムに抽出して配列で返す
 * indexes.length >= chooseNumber
 *
 * @param {*} indexes
 * @param {*} chooseNumber
 */
exports.getRandomIndexes = (indexes, chooseNumber) => __awaiter(void 0, void 0, void 0, function* () {
    let randomIndexes = [];
    LOOP: for (let i = 0; i < chooseNumber; i++) {
        while (true) {
            const num = Math.floor(Math.random() * indexes.length);
            const index = indexes[num];
            let status = true;
            for (const randomIndex of randomIndexes) {
                if (randomIndex == index) {
                    status = false;
                }
            }
            if (status) {
                randomIndexes.push(index);
                continue LOOP;
            }
        }
    }
    return randomIndexes;
});
exports.getRandomNumber = (minNumber, maxNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const number = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    return number;
});
exports.getRandomBoolean = () => __awaiter(void 0, void 0, void 0, function* () {
    const i = Math.floor(Math.random() * 2);
    if (i == 1) {
        return true;
    }
    else {
        return false;
    }
});
