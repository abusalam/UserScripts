// ==UserScript==
// @name         COVID-19-WhatsApp-Web-Bot
// @namespace    https://github.com/abusalam
// @version      0.0.78
// @description  Send Automated Reply for COVID-19 Self Assesment
// @author       Abu Salam Parvez Alam
// @match        https://web.whatsapp.com/
// @grant        none
// @downloadURL https://github.com/abusalam/UserScripts/raw/master/COVID-19-WhatsApp-WebBot.user.js
// @updateURL   https://github.com/abusalam/UserScripts/raw/master/COVID-19-WhatsApp-WebBot.user.js
// @icon        http://www.gravatar.com/avatar/43f0ea57b814fbdcb3793ca3e76971cf
// ==/UserScript==

function jQueryInclude(callback) {
    var jQueryScript = document.createElement('script');
    var jQueryCDN = '//ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js';
    jQueryScript.setAttribute('src', jQueryCDN);
    jQueryScript.addEventListener('load', function () {
        var UserScript = document.createElement('script');
        UserScript.textContent = 'window.jQ=jQuery.noConflict(true);'
            + 'var BaseURL = "https://www.malda.gov.in/";'
            + 'var Version = "v0.0.78";'
            + '(' + callback.toString() + ')();';
        document.body.appendChild(UserScript);
    }, false);
    document.body.appendChild(jQueryScript);
}

/* eslint-disable */

jQueryInclude(function () {

    var botStarter = setInterval(function() {
        // Execute the Bot only when Bell Icon for Desktop Notifications is shown
        if (jQ("._2vbYK").filter(":visible").length>0) {
            window.WappBot = {
                configWappBot: {
                    useApi: false,
                    uriApi: "https://wapp-bot.herokuapp.com/message",
                    ignoreChat: [],
                    messageInitial: (chatId) => {
                        return {
                            text: WappBot.configWappBot.covidQueries.msgWelcome,
                            image: null //"https://pmrpressrelease.com/wp-content/uploads/2019/05/Telehealth-1.jpg"
                        };
                    },
                    messageIncorrect: (chatId) => {
                        if (sessionStorage.getItem(chatId + "-currQryKey").indexOf("Bn") > -1) {
                            return {
                                text: WappBot.configWappBot.covidQueries.msgOptionBn
                            };
                        } else if (sessionStorage.getItem(chatId + "-currQryKey") != "qryApp") {
                            return {
                                text: WappBot.configWappBot.covidQueries.msgOption
                            };
                        } else {
                            return {
                                text: WappBot.configWappBot.covidQueries.msgOption + WappBot.configWappBot.covidQueries.msgOptionBn
                            };
                        }
                    },
                    messageOption: (sendOption, msgId, newMessage) => {

                        let currQryKey = sessionStorage.getItem(msgId + "-currQryKey");

                        if (currQryKey == null) {
                            currQryKey = "qryApp";
                            if (!sendOption) sessionStorage.setItem(msgId + "-currQryKey", "qryApp");
                        }

                        let currQry = JSON.parse(sessionStorage.getItem("covidQuery_" + currQryKey));

                        if (sendOption) { //Prepare Options to be asked
                            currOptions = currQry.options;
                        } else { //Prepare Question to be asked

                            // Get Score for currentAnswer
                            let currScore = sessionStorage.getItem(msgId + "-Score");
                            if (currScore == null) currScore = 0;
                            // End of Update Score for currentAnswer

                            let nextQryKey = currQry.options[newMessage];
                            if (nextQryKey !== undefined) {
                                sessionStorage.setItem(msgId + "-currQryKey", nextQryKey);

                                // Update Score for currentAnswer
                                currScore = parseInt(currQry.scores[newMessage]) + parseInt(currScore);
                                if (nextQryKey == "qryLang") currScore = 0;
                                sessionStorage.setItem(msgId + "-Score", currScore);
                                // End of Update Score for currentAnswer
                            }

                            let currReply = JSON.parse(sessionStorage.getItem("covidQuery_" + currQry.options[newMessage])).ask;
                            console.log("Asking-" + currQryKey + ": " + currReply);
                            if ((currQryKey.indexOf("qryFinished") > -1) && (parseInt(newMessage) != 2)) {
                                if (currScore < WappBot.configWappBot.covidQueries.lessThan) {
                                    currReply = currQry.scores["G1"];
                                } else if (currScore > WappBot.configWappBot.covidQueries.greaterThan) {
                                    currReply = currQry.scores["G3"];
                                } else {
                                    currReply = currQry.scores["G2"] + "\n\n" + currQry.scores["G1"];
                                }
                                let msgFeedback = sessionStorage.getItem(msgId + "-msgFeedback");
                                if (msgFeedback == null) {
                                    msgFeedback = "";
                                } else {
                                    msgFeedback = "\n\n*Message:* _" + msgFeedback + "_";
                                }
                                WAPI.sendMessage(
                                    WAPI.getAllGroups().find(
                                        (group) => (group.__x_name == sessionStorage.getItem("covidQuery_ReportToGroup").slice(1, -1))
                                    ).__x_id._serialized, "*Name:* " + sessionStorage.getItem(msgId + "-Name")
                                    + "\n*Mobile No:* " + msgId.slice(2, -5) + msgFeedback + "\n\nScore: " + currScore + "\nAdvice: " + currReply
                                );
                                localStorage.setItem(
                                    "scoreReport_" + msgId.slice(2, -5),
                                    JSON.stringify(
                                        {
                                            Name: sessionStorage.getItem(msgId + "-Name"),
                                            Score: currScore,
                                            Message: sessionStorage.getItem(msgId + "-msgFeedback"),
                                            Timestamp: Date.now(),
                                        }
                                    )
                                );
                                setTimeout(function (msgId) {
                                    WappBot.configWappBot.allowToRepeat(msgId);
                                }, WappBot.configWappBot.covidQueries.RepeatTimeout, msgId);
                            }
                            currReply = currReply.replace(/{{msgFeedback}}/g, sessionStorage.getItem(msgId + "-msgFeedback"));
                            currReply = currReply.replace(/{{Version}}/g, Version);
                            currOptions = { // TODO: Process Templates
                                text: currReply,
                                image: null
                            };
                        }

                        console.log("Got " + currQryKey + "=>" + sessionStorage.getItem(msgId + "-currQryKey") + " sendOption: (" + sendOption + "), msgId: (" + msgId + '), newMessage: (' + newMessage + ')');

                        return currOptions;
                    },
                    updateOptions: qryOptions => {
                        for (let qryKey in qryOptions) {
                            sessionStorage.setItem("covidQuery_" + qryKey, JSON.stringify(qryOptions[qryKey]));
                        }

                        Version = WappBot.configWappBot.expandTemplate(qryOptions["Version"]);
                        WappBot.configWappBot.covidQueries = qryOptions;
                    },
                    allowToRepeat: chatId => {
                        delete WappBot.configWappBot.ignoreChat[WappBot.configWappBot.ignoreChat.indexOf(chatId)];
                        sessionStorage.removeItem(chatId + "-currQryKey");
                        sessionStorage.removeItem(chatId + "-msgFeedback");
                        sessionStorage.setItem(chatId + "-Score", 0);
                        console.log("Allowed: " + chatId)
                    },
                    expandTemplate: (txtTemplate, dataValues) => {
                        return txtTemplate.replace("{{Version}}", Version);
                        // TODO: Make templating Dynamic
                        // TODO: Test the Templates
                    },
                    covidQueries: {
                        "Version": "{{Version}}",
                        "msgWelcome": "Welcome to Telemedicine Helpline, Malda\nমালদা টেলিমেডিসিন হেল্পলাইনে আপনাকে স্বাগতম\n\nPlease reply with 1 or 2 to continue...\nদয়া করে 1 বা 2 দিয়ে উত্তর দিন\n\n1 ➙ English\n2 ➙ বাংলা\n",
                        "msgOption": "Incorrect option, please reply with: \n",
                        "msgOptionBn": "ভুল বিকল্প, দয়া করে এগুলোর মধ্যে উত্তর দিন:\n",
                        "lessThan": 10,
                        "greaterThan": 14,
                        "ReportToGroup": "COVID-19 Malda",
                        "RepeatTimeout": 36000000,
                        "qryApp": {
                            ask: "Please Select Questionaire?\n"
                                + "1. Arogya Setu Questionaire\n2. Malda TeleMedicine Questionaire\n",
                            options: {
                                "1": "qryName",
                                "2": "qryNameBn",
                            },
                            scores: {
                                "1": 0,
                                "2": 0,
                            },
                        },

                        "qryUpdate": {
                            ask: "Done\n",
                            options: {
                                "Done": "qryUpdate"
                            },
                            scores: {
                                "Done": 0
                            }
                        },

                        "qryLang": {
                            ask: "Please Select language\nভাষা নির্বাচন করুন\n"
                                + "1 ➙ English\n"
                                + "2 ➙ বাংলা\n",
                            options: {
                                "1": "qryName",
                                "2": "qryNameBn",
                            },
                            scores: {
                                "1": 0,
                                "2": 0,
                            }
                        },

                        "qryName": {
                            ask: "What is your Name?\n",
                            options: {
                                "Name": "qryAge"
                            },
                            scores: {
                                "Name": 0
                            }
                        },
                        "qryNameBn": {
                            ask: "আপনার নাম কি?\n",
                            options: {
                                "Name": "qryAgeBn"
                            },
                            scores: {
                                "Name": 0
                            }
                        },

                        "qryAge": {
                            ask: "What is your Age?\n"
                                + "1 ➙ Less than 40\n"
                                + "2 ➙ 40 - 50\n"
                                + "3 ➙ 50 - 60\n"
                                + "4 ➙ More than 60",
                            options: {
                                "1": "qryFever",
                                "2": "qryFever",
                                "3": "qryFever",
                                "4": "qryFever",
                            },
                            scores: {
                                "1": 0,
                                "2": 1,
                                "3": 2,
                                "4": 3,
                            }
                        },
                        "qryAgeBn": {
                            ask: "আপনার বয়স কত?\n"
                                + "1 ➙ ৪০ থেকে কম\n"
                                + "2 ➙ 40 থেকে 50\n"
                                + "3 ➙ 50 থেকে 60\n"
                                + "4 ➙ 60 থেকে বেশি",
                            options: {
                                "1": "qryFeverBn",
                                "2": "qryFeverBn",
                                "3": "qryFeverBn",
                                "4": "qryFeverBn",
                            },
                            scores: {
                                "1": 0,
                                "2": 1,
                                "3": 2,
                                "4": 3,
                            }
                        },

                        "qryFever": {
                            ask: "Do you have fever?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qryCough",
                                "2": "qryCough",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },
                        "qryFeverBn": {
                            ask: "আপনার জ্বর আছে?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryCoughBn",
                                "2": "qryCoughBn",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },

                        "qryFeverDays": {
                            ask: "How long is the fever persisting?\n"
                                + "1 ➙ Less than 3 days\n"
                                + "2 ➙ More than 3 days",
                            options: {
                                "1": "qryFeverMeasure",
                                "2": "qryFeverMeasure",
                            },
                            scores: {
                                "1": 1,
                                "2": 2,
                            }
                        },
                        "qryFeverDaysBn": {
                            ask: "জ্বর কত দিন রয়েছে?\n"
                                + "1 ➙ ৩ দিনের থেকে কম\n"
                                + "2 ➙ ৩ দিনের থেকে বেশি",
                            options: {
                                "1": "qryFeverMeasureBn",
                                "2": "qryFeverMeasureBn",
                            },
                            scores: {
                                "1": 1,
                                "2": 2,
                            }
                        },

                        "qryFeverMeasure": {
                            ask: "Measured it with thermometer?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qryFeverTemp",
                                "2": "qryCough"
                            },
                            scores: {
                                "1": 0,
                                "2": 0,
                            }
                        },
                        "qryFeverMeasureBn": {
                            ask: "থার্মোমিটার দিয়ে পরিমাপ করা হয়েছে?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryFeverTempBn",
                                "2": "qryCoughBn"
                            },
                            scores: {
                                "1": 0,
                                "2": 0,
                            }
                        },

                        "qryFeverTemp": {
                            ask: "What was the maximum temperature?\n"
                                + "1 ➙ Less than 99.5°F\n"
                                + "2 ➙ More than 99.5°F",
                            options: {
                                "1": "qryCough",
                                "2": "qryCough"
                            },
                            scores: {
                                "1": 1,
                                "2": 2,
                            }
                        },
                        "qryFeverTempBn": {
                            ask: "সর্বোচ্চ তাপমাত্রা কত ছিল?\n"
                                + "1 ➙ ৯৯.৫°F থেকে কম\n"
                                + "2 ➙ ৯৯.৫°F থেকে বেশি",
                            options: {
                                "1": "qryCoughBn",
                                "2": "qryCoughBn"
                            },
                            scores: {
                                "1": 1,
                                "2": 2,
                            }
                        },

                        "qryCough": {
                            ask: "Do you have dry cough?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qryThroat",
                                "2": "qryThroat",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },
                        "qryCoughBn": {
                            ask: "আপনার কি শুকনো কাশি আছে?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryThroatBn",
                                "2": "qryThroatBn",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },

                        "qryCoughSince": {
                            ask: "How long you have dry cough?\n"
                                + "1 ➙ More than 2 weeks\n"
                                + "2 ➙ Less than 2 weeks",
                            options: {
                                "1": "qryThroat",
                                "2": "qryThroat",
                            },
                            scores: {
                                "1": 0,
                                "2": 1,
                            }
                        },
                        "qryCoughSinceBn": {
                            ask: "আপনার কত দিন থেকে শুকনো কাশি আছে?\n"
                                + "1 ➙ ২ সপ্তাহের বেশি\n"
                                + "2 ➙ ২ সপ্তাহের কম",
                            options: {
                                "1": "qryThroatBn",
                                "2": "qryThroatBn",
                            },
                            scores: {
                                "1": 0,
                                "2": 1,
                            }
                        },

                        "qryThroat": {
                            ask: "Do you have sore throat?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qryBreath",
                                "2": "qryBreath",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },
                        "qryThroatBn": {
                            ask: "আপনার কি গলা ব্যাথা আছে?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryBreathBn",
                                "2": "qryBreathBn",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },

                        "qryBreath": {
                            ask: "Are you suffering from shortness of breath?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qryDiarrhea",
                                "2": "qryDiarrhea",
                            },
                            scores: {
                                "1": 5,
                                "2": 0,
                            }
                        },
                        "qryBreathBn": {
                            ask: "আপনার কি শ্বাসকষ্ট হচ্ছে?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryDiarrheaBn",
                                "2": "qryDiarrheaBn"
                            },
                            scores: {
                                "1": 5,
                                "2": 0
                            }
                        },

                        "qryDiarrhea": {
                            ask: "Do you have diarrhea?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qryContact",
                                "2": "qryContact",
                            },
                            scores: {
                                "1": 1,
                                "2": 0,
                            }
                        },
                        "qryDiarrheaBn": {
                            ask: "আপনার কি পাতলা পায়খানা হচ্ছে?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryContactBn",
                                "2": "qryContactBn"
                            },
                            scores: {
                                "1": 1,
                                "2": 0
                            }
                        },

                        "qryContact": {
                            ask: "Have you come in contact with any Corona affected person(s) in last 14 days?\n"
                                + "1 ➙ Yes\n2 ➙ No\n",
                            options: {
                                "1": "qryFinished",
                                "2": "qryFinished",
                            },
                            scores: {
                                "1": 5,
                                "2": 0,
                            }
                        },
                        "qryContactBn": {
                            ask: "আপনি কি গত ১৪ দিনে কোনও করোনায় আক্রান্ত রোগীর সংস্পর্শে এসেছেন?\n"
                                + "1 ➙ হ্যাঁ\n2 ➙ না\n",
                            options: {
                                "1": "qryFinishedBn",
                                "2": "qryFinishedBn",
                            },
                            scores: {
                                "1": 5,
                                "2": 0,
                            }
                        },

                        "qryFinished": {
                            ask: "Please note that information from this chat will be used for monitoring & management of the current health crisis and research in the fight against COVID-19.\n\n"
                                + "Accurate answers help us to help you better. Medical and support staff are valuable and very limited. Be a responsible citizen\n\n"
                                + "1 ➙ I have given accurate answers\n"
                                + "2 ➙ Try again with accurate answers",
                            options: {
                                "1": "qryClosingReport",
                                "2": "qryLang",
                            },
                            scores: {
                                "1": 0,
                                "2": 0,
                                "G1": "Stay at home maintaining social distances, hand hygiene and using mask. Please repeat this assessment if any new symptom arises.",
                                "G2": "Please consult your nearest doctor or Health Facility. Stay at home maintaining social distances, hand hygiene and using mask.",
                                "G3": "You are at risk. Our team will contact you shortly. Please keep your mobile phone open and wait for the call.",
                            }
                        },
                        "qryFinishedBn": {
                            ask: "এই বার্তার তথ্য COVID-19 এর বিরুদ্ধে লড়াই এর জন্য বর্তমান সঙ্কট পর্যবেক্ষণ, পরিচালন এবং গবেষণার জন্য ব্যবহৃত হবে।\n\n"
                                + "সঠিক উত্তরগুলি আপনাকে আরও ভালভাবে সহায়তা করতে আমাদের সহায়তা করে। চিকিৎসা এবং সহায়তা কর্মীরা মূল্যবান এবং খুব সীমাবদ্ধ। একজন দায়িত্বশীল নাগরিক হন।\n\n"
                                + "1 ➙ আমি সঠিক উত্তর দিয়েছি\n"
                                + "2 ➙ সঠিক উত্তর দিয়ে আবার চেষ্টা করি",
                            options: {
                                "1": "qryClosingReportBn",
                                "2": "qryLang",
                            },
                            scores: {
                                "1": 0,
                                "2": 0,
                                "G1": "বাড়ীতে থাকুন, সামাজিক দূরত্ব বজায় রাখুন, নিয়মিত হাত পরিষ্কার রাখুন এবং মাস্ক ব্যবহার করুন। কোনও নতুন লক্ষণ দেখা দিলে দয়া করে এই মূল্যায়নটি পুনরাবৃত্তি করুন।",
                                "G2": "আপনার নিকটবর্তী ডাক্তারের সাথে অথবা স্বাস্থ্য কেন্দ্রে যোগাযোগ করুন।",
                                "G3": "যদি আপনার তথ্য সঠিক হয় তবে আপনি করোনায় সংক্রমণের ঝুঁকিতে আছেন।\n\nআমাদের দল শীঘ্রই আপনার সাথে যোগাযোগ করবে। আপনার মোবাইল ফোনটি চালু রাখুন এবং আমাদের ফোন কলের জন্য অপেক্ষা করুন।",
                            }
                        },

                        "qryClosingReport": {
                            ask: "Thank you for your kind support.\n\n\nVersion: {{Version}}",
                            options: {
                                "qryNext": "qryClosingFeedback"
                            },
                            scores: {
                                "qryNext": 0
                            }
                        },
                        "qryClosingReportBn": {
                            ask: "আপনার সহযোগিতার জন্য ধন্যবাদ।\n\n\nVersion: {{Version}}",
                            options: {
                                "qryNext": "qryClosingFeedbackBn"
                            },
                            scores: {
                                "qryNext": 0
                            }
                        },

                        "qryClosingFeedback": {
                            ask: "Do you have something to say?\n\n"
                                + "1 ➙ Yes\n2 ➙ No\n",
                            options: {
                                "1": "qryFeedback",
                                "2": "qryClosingReport",
                            },
                            scores: {
                                "1": 0,
                                "2": 0,
                            }
                        },
                        "qryClosingFeedbackBn": {
                            ask: "আপনি কি কিছু বলতে চান?\n\n"
                                + "1 ➙ হ্যাঁ\n2 ➙ না\n",
                            options: {
                                "1": "qryFeedbackBn",
                                "2": "qryClosingReportBn",
                            },
                            scores: {
                                "1": 0,
                                "2": 0,
                            }
                        },

                        "qryFeedback": {
                            ask: "Please type your message:",
                            options: {
                                "msgFeedback": "qryFinishedFeedback"
                            },
                            scores: {
                                "msgFeedback": 0,
                            }
                        },
                        "qryFeedbackBn": {
                            ask: "আপনার মেসেজ টাইপ করুন:",
                            options: {
                                "msgFeedback": "qryFinishedFeedbackBn"
                            },
                            scores: {
                                "msgFeedback": 0,
                            }
                        },

                        "qryFinishedFeedback": {
                            ask: "Please verify your message below, is that ok?\n\n"
                                + "*Message:* _{{msgFeedback}}_\n\n"
                                + "1 ➙ I have verified the message and it's ok\n"
                                + "2 ➙ I need to change the message",
                            options: {
                                "1": "qryClosed",
                                "2": "qryFeedback",
                            },
                            scores: {
                                "1": 0,
                                "2": 0,
                                "G1": "Stay at home maintaining social distances, hand hygiene and using mask. Please repeat this assessment if any new symptom arises.\n",
                                "G2": "Please consult your nearest doctor or Health Facility. Stay at home maintaining social distances, hand hygiene and using mask.\n",
                                "G3": "You are at risk. Our team will contact you shortly. Please keep your mobile phone open and wait for the call.\n",
                            }
                        },
                        "qryFinishedFeedbackBn": {
                            ask: "দয়া করে নীচে আপনার মেসেজ যাচাই করুন, এটি কি ঠিক আছে?\n\n"
                                + "*Message:* _{{msgFeedback}}_\n\n"
                                + "1 ➙ আমি মেসেজ যাচাই করেছি এবং ঠিক আছে\n"
                                + "2 ➙ আমার মেসেজ বদলাতে হবে",
                            options: {
                                "1": "qryClosedBn",
                                "2": "qryFeedbackBn",
                            },
                            scores: {
                                "1": 0,
                                "2": 0,
                                "G1": "বাড়ীতে থাকুন, সামাজিক দূরত্ব বজায় রাখুন, নিয়মিত হাত পরিষ্কার রাখুন এবং মাস্ক ব্যবহার করুন। কোনও নতুন লক্ষণ দেখা দিলে দয়া করে এই মূল্যায়নটি পুনরাবৃত্তি করুন।",
                                "G2": "আপনার নিকটবর্তী ডাক্তারের সাথে অথবা স্বাস্থ্য কেন্দ্রে যোগাযোগ করুন।",
                                "G3": "যদি আপনার তথ্য সঠিক হয় তবে আপনি করোনায় সংক্রমণের ঝুঁকিতে আছেন।\n\nআমাদের দল শীঘ্রই আপনার সাথে যোগাযোগ করবে। আপনার মোবাইল ফোনটি চালু রাখুন এবং আমাদের ফোন কলের জন্য অপেক্ষা করুন।",
                            }
                        },

                        "qryClosed": {
                            ask: "Thank you for your kind support.\n\nYou can repeat this assesment again tomorrow.\n\nVersion: {{Version}}",
                            options: {
                                "qryApp": "qryClosed"
                            },
                            scores: {
                                "qryApp": 0
                            }
                        },
                        "qryClosedBn": {
                            ask: "আপনার সহযোগিতার জন্য ধন্যবাদ।\n\nআপনি আগামীকাল আবার এই মূল্যায়নটি পুনরাবৃত্তি করতে পারবেন।\n\nVersion: {{Version}}",
                            options: {
                                "qryApp": "qryClosedBn"
                            },
                            scores: {
                                "qryApp": 0
                            }
                        },
                    }
                }
            };

            /**
             * This script contains WAPI functions that need to be run in the context of the webpage
             */

            /**
             * Auto discovery the webpack object references of instances that contains all functions used by the WAPI
             * functions and creates the Store object.
             */
            if (!window.Store) {
                (function () {
                    function getStore(modules) {
                        let foundCount = 0;
                        let neededObjects = [
                            { id: "Store", conditions: (module) => (module.default && module.default.Chat && module.default.Msg) ? module.default : null },
                            { id: "MediaCollection", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.processAttachments) ? module.default : null },
                            { id: "MediaProcess", conditions: (module) => (module.BLOB) ? module : null },
                            { id: "Wap", conditions: (module) => (module.createGroup) ? module : null },
                            { id: "ServiceWorker", conditions: (module) => (module.default && module.default.killServiceWorker) ? module : null },
                            { id: "State", conditions: (module) => (module.STATE && module.STREAM) ? module : null },
                            { id: "WapDelete", conditions: (module) => (module.sendConversationDelete && module.sendConversationDelete.length == 2) ? module : null },
                            { id: "Conn", conditions: (module) => (module.default && module.default.ref && module.default.refTTL) ? module.default : null },
                            { id: "WapQuery", conditions: (module) => (module.queryExist) ? module : ((module.default && module.default.queryExist) ? module.default : null) },
                            { id: "CryptoLib", conditions: (module) => (module.decryptE2EMedia) ? module : null },
                            { id: "OpenChat", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.openChat) ? module.default : null },
                            { id: "UserConstructor", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.isServer && module.default.prototype.isUser) ? module.default : null },
                            { id: "SendTextMsgToChat", conditions: (module) => (module.sendTextMsgToChat) ? module.sendTextMsgToChat : null },
                            { id: "SendSeen", conditions: (module) => (module.sendSeen) ? module.sendSeen : null },
                            { id: "sendDelete", conditions: (module) => (module.sendDelete) ? module.sendDelete : null }
                        ];
                        for (let idx in modules) {
                            if ((typeof modules[idx] === "object") && (modules[idx] !== null)) {
                                let first = Object.values(modules[idx])[0];
                                if ((typeof first === "object") && (first.exports)) {
                                    for (let idx2 in modules[idx]) {
                                        let module = modules(idx2);
                                        if (!module) {
                                            continue;
                                        }
                                        neededObjects.forEach((needObj) => {
                                            if (!needObj.conditions || needObj.foundedModule)
                                                return;
                                            let neededModule = needObj.conditions(module);
                                            if (neededModule !== null) {
                                                foundCount++;
                                                needObj.foundedModule = neededModule;
                                            }
                                        });
                                        if (foundCount == neededObjects.length) {
                                            break;
                                        }
                                    }

                                    let neededStore = neededObjects.find((needObj) => needObj.id === "Store");
                                    window.Store = neededStore.foundedModule ? neededStore.foundedModule : {};
                                    neededObjects.splice(neededObjects.indexOf(neededStore), 1);
                                    neededObjects.forEach((needObj) => {
                                        if (needObj.foundedModule) {
                                            window.Store[needObj.id] = needObj.foundedModule;
                                        }
                                    });
                                    window.Store.sendMessage = function (e) {
                                        return window.Store.SendTextMsgToChat(this, ...arguments);
                                    };
                                    return window.Store;
                                }
                            }
                        }
                    }

                    if (typeof webpackJsonp === 'function') {
                        webpackJsonp([], {'parasite': (x, y, z) => getStore(z)}, ['parasite']);
                    } else {
                        webpackJsonp.push([
                            ['parasite'],
                            {
                                parasite: function (o, e, t) {
                                    getStore(t);
                                }
                            },
                            [['parasite']]
                        ]);
                    }

                })();
            }

            window.WAPI = {
                lastRead: {}
            };

            window.WAPI._serializeRawObj = (obj) => {
                if (obj) {
                    return obj.toJSON();
                }
                return {}
            };

            /**
            * Serializes a chat object
            *
            * @param rawChat Chat object
            * @returns {{}}
            */

            window.WAPI._serializeChatObj = (obj) => {
                if (obj == undefined) {
                    return null;
                }

                return Object.assign(window.WAPI._serializeRawObj(obj), {
                    kind         : obj.kind,
                    isGroup      : obj.isGroup,
                    contact      : obj['contact'] ? window.WAPI._serializeContactObj(obj['contact'])        : null,
                    groupMetadata: obj["groupMetadata"] ? window.WAPI._serializeRawObj(obj["groupMetadata"]): null,
                    presence     : obj["presence"] ? window.WAPI._serializeRawObj(obj["presence"])          : null,
                    msgs         : null
                });
            };

            window.WAPI._serializeContactObj = (obj) => {
                if (obj == undefined) {
                    return null;
                }

                return Object.assign(window.WAPI._serializeRawObj(obj), {
                    formattedName      : obj.formattedName,
                    isHighLevelVerified: obj.isHighLevelVerified,
                    isMe               : obj.isMe,
                    isMyContact        : obj.isMyContact,
                    isPSA              : obj.isPSA,
                    isUser             : obj.isUser,
                    isVerified         : obj.isVerified,
                    isWAContact        : obj.isWAContact,
                    profilePicThumbObj : obj.profilePicThumb ? WAPI._serializeProfilePicThumb(obj.profilePicThumb): {},
                    statusMute         : obj.statusMute,
                    msgs               : null
                });
            };

            window.WAPI._serializeMessageObj = (obj) => {
                if (obj == undefined) {
                    return null;
                }

                return Object.assign(window.WAPI._serializeRawObj(obj), {
                    id            : obj.id._serialized,
                    sender        : obj["senderObj"] ? WAPI._serializeContactObj(obj["senderObj"]): null,
                    timestamp     : obj["t"],
                    content       : obj["body"],
                    isGroupMsg    : obj.isGroupMsg,
                    isLink        : obj.isLink,
                    isMMS         : obj.isMMS,
                    isMedia       : obj.isMedia,
                    isNotification: obj.isNotification,
                    isPSA         : obj.isPSA,
                    type          : obj.type,
                    chat          : WAPI._serializeChatObj(obj['chat']),
                    chatId        : obj.id.remote,
                    quotedMsgObj  : WAPI._serializeMessageObj(obj['_quotedMsgObj']),
                    mediaData     : window.WAPI._serializeRawObj(obj['mediaData'])
                });
            };

            window.WAPI._serializeNumberStatusObj = (obj) => {
                if (obj == undefined) {
                    return null;
                }

                return Object.assign({}, {
                    id               : obj.jid,
                    status           : obj.status,
                    isBusiness       : (obj.biz === true),
                    canReceiveMessage: (obj.status === 200)
                });
            };

            window.WAPI._serializeProfilePicThumb = (obj) => {
                if (obj == undefined) {
                    return null;
                }

                return Object.assign({}, {
                    eurl   : obj.eurl,
                    id     : obj.id,
                    img    : obj.img,
                    imgFull: obj.imgFull,
                    raw    : obj.raw,
                    tag    : obj.tag
                });
            }

            window.WAPI.createGroup = function (name, contactsId) {
                if (!Array.isArray(contactsId)) {
                    contactsId = [contactsId];
                }

                return window.Store.Wap.createGroup(name, contactsId);
            };

            window.WAPI.leaveGroup = function (groupId) {
                groupId = typeof groupId == "string" ? groupId : groupId._serialized;
                var group = WAPI.getChat(groupId);
                return group.sendExit()
            };


            window.WAPI.getAllContacts = function (done) {
                const contacts = window.Store.Contact.map((contact) => WAPI._serializeContactObj(contact));

                if (done !== undefined) done(contacts);
                return contacts;
            };

            /**
            * Fetches all contact objects from store, filters them
            *
            * @param done Optional callback function for async execution
            * @returns {Array|*} List of contacts
            */
            window.WAPI.getMyContacts = function (done) {
                const contacts = window.Store.Contact.filter((contact) => contact.isMyContact === true).map((contact) => WAPI._serializeContactObj(contact));
                if (done !== undefined) done(contacts);
                return contacts;
            };

            /**
            * Fetches contact object from store by ID
            *
            * @param id ID of contact
            * @param done Optional callback function for async execution
            * @returns {T|*} Contact object
            */
            window.WAPI.getContact = function (id, done) {
                const found = window.Store.Contact.get(id);

                if (done !== undefined) done(window.WAPI._serializeContactObj(found))
                return window.WAPI._serializeContactObj(found);
            };

            /**
            * Fetches all chat objects from store
            *
            * @param done Optional callback function for async execution
            * @returns {Array|*} List of chats
            */
            window.WAPI.getAllChats = function (done) {
                const chats = window.Store.Chat.map((chat) => WAPI._serializeChatObj(chat));

                if (done !== undefined) done(chats);
                return chats;
            };

            window.WAPI.haveNewMsg = function (chat) {
                return chat.unreadCount > 0;
            };

            window.WAPI.getAllChatsWithNewMsg = function (done) {
                const chats = window.Store.Chat.filter(window.WAPI.haveNewMsg).map((chat) => WAPI._serializeChatObj(chat));

                if (done !== undefined) done(chats);
                return chats;
            };

            /**
            * Fetches all chat IDs from store
            *
            * @param done Optional callback function for async execution
            * @returns {Array|*} List of chat id's
            */
            window.WAPI.getAllChatIds = function (done) {
                const chatIds = window.Store.Chat.map((chat) => chat.id._serialized || chat.id);

                if (done !== undefined) done(chatIds);
                return chatIds;
            };

            /**
            * Fetches all groups objects from store
            *
            * @param done Optional callback function for async execution
            * @returns {Array|*} List of chats
            */
            window.WAPI.getAllGroups = function (done) {
                const groups = window.Store.Chat.filter((chat) => chat.isGroup);

                if (done !== undefined) done(groups);
                return groups;
            };

            /**
            * Fetches chat object from store by ID
            *
            * @param id ID of chat
            * @param done Optional callback function for async execution
            * @returns {T|*} Chat object
            */
            window.WAPI.getChat = function (id, done) {
                id = typeof id == "string" ? id : id._serialized;
                const found = window.Store.Chat.get(id);
                found.sendMessage = (found.sendMessage) ? found.sendMessage : function () { return window.Store.sendMessage.apply(this, arguments); };
                if (done !== undefined) done(found);
                return found;
            }

            window.WAPI.getChatByName = function (name, done) {
                const found = window.WAPI.getAllChats().find(val => val.name.includes(name))
                if (done !== undefined) done(found);
                return found;
            };

            window.WAPI.sendImageFromDatabasePicBot = function (picId, chatId, caption) {
                var chatDatabase = window.WAPI.getChatByName('DATABASEPICBOT');
                var msgWithImg   = chatDatabase.msgs.find((msg) => msg.caption == picId);

                if (msgWithImg === undefined) {
                    return false;
                }
                var chatSend = WAPI.getChat(chatId);
                if (chatSend === undefined) {
                    return false;
                }
                const oldCaption = msgWithImg.caption;

                msgWithImg.id.id     = window.WAPI.getNewId();
                msgWithImg.id.remote = chatId;
                msgWithImg.t         = Math.ceil(new Date().getTime() / 1000);
                msgWithImg.to        = chatId;

                if (caption !== undefined && caption !== '') {
                    msgWithImg.caption = caption;
                } else {
                    msgWithImg.caption = '';
                }

                msgWithImg.collection.send(msgWithImg).then(function (e) {
                    msgWithImg.caption = oldCaption;
                });

                return true;
            };

            window.WAPI.sendMessageWithThumb = function (thumb, url, title, description, text, chatId, done) {
                var chatSend = WAPI.getChat(chatId);
                if (chatSend === undefined) {
                    if (done !== undefined) done(false);
                    return false;
                }
                var linkPreview = {
                    canonicalUrl: url,
                    description : description,
                    matchedText : url,
                    title       : title,
                    thumbnail   : thumb,
                    compose: true
                };
                chatSend.sendMessage(text, { linkPreview: linkPreview,
                                            mentionedJidList: [],
                                            quotedMsg: null,
                                            quotedMsgAdminGroupJid: null });
                if (done !== undefined) done(true);
                return true;
            };

            window.WAPI.getNewId = function () {
                var text     = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 20; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                return text;
            };

            window.WAPI.getChatById = function (id, done) {
                let found = WAPI.getChat(id);
                if (found) {
                    found = WAPI._serializeChatObj(found);
                } else {
                    found = false;
                }

                if (done !== undefined) done(found);
                return found;
            };


            /**
            * I return all unread messages from an asked chat and mark them as read.
            *
            * :param id: chat id
            * :type  id: string
            *
            * :param includeMe: indicates if user messages have to be included
            * :type  includeMe: boolean
            *
            * :param includeNotifications: indicates if notifications have to be included
            * :type  includeNotifications: boolean
            *
            * :param done: callback passed by selenium
            * :type  done: function
            *
            * :returns: list of unread messages from asked chat
            * :rtype: object
            */
            window.WAPI.getUnreadMessagesInChat = function (id, includeMe, includeNotifications, done) {
                // get chat and its messages
                let chat     = WAPI.getChat(id);
                let messages = chat.msgs._models;

                // initialize result list
                let output = [];

                // look for unread messages, newest is at the end of array
                for (let i = messages.length - 1; i >= 0; i--) {
                    // system message: skip it
                    if (i === "remove") {
                        continue;
                    }

                    // get message
                    let messageObj = messages[i];

                    // found a read message: stop looking for others
                    if (typeof (messageObj.isNewMsg) !== "boolean" || messageObj.isNewMsg === false) {
                        continue;
                    } else {
                        messageObj.isNewMsg = false;
                        // process it
                        let message = WAPI.processMessageObj(messageObj,
                                includeMe,
                                includeNotifications);

                        // save processed message on result list
                        if (message)
                            output.push(message);
                    }
                }
                // callback was passed: run it
                if (done !== undefined) done(output);
                // return result list
                return output;
            }
            ;


            /**
            * Load more messages in chat object from store by ID
            *
            * @param id ID of chat
            * @param done Optional callback function for async execution
            * @returns None
            */
            window.WAPI.loadEarlierMessages = function (id, done) {
                const found = WAPI.getChat(id);
                if (done !== undefined) {
                    found.loadEarlierMsgs().then(function () {
                        done()
                    });
                } else {
                    found.loadEarlierMsgs();
                }
            };

            /**
            * Load more messages in chat object from store by ID
            *
            * @param id ID of chat
            * @param done Optional callback function for async execution
            * @returns None
            */
            window.WAPI.loadAllEarlierMessages = function (id, done) {
                const found = WAPI.getChat(id);
                x = function () {
                    if (!found.msgs.msgLoadState.noEarlierMsgs) {
                        found.loadEarlierMsgs().then(x);
                    } else if (done) {
                        done();
                    }
                };
                x();
            };

            window.WAPI.asyncLoadAllEarlierMessages = function (id, done) {
                done();
                window.WAPI.loadAllEarlierMessages(id);
            };

            window.WAPI.areAllMessagesLoaded = function (id, done) {
                const found = WAPI.getChat(id);
                if (!found.msgs.msgLoadState.noEarlierMsgs) {
                    if (done) done(false);
                    return false
                }
                if (done) done(true);
                return true
            };

            /**
            * Load more messages in chat object from store by ID till a particular date
            *
            * @param id ID of chat
            * @param lastMessage UTC timestamp of last message to be loaded
            * @param done Optional callback function for async execution
            * @returns None
            */

            window.WAPI.loadEarlierMessagesTillDate = function (id, lastMessage, done) {
                const found = WAPI.getChat(id);
                x = function () {
                    if (found.msgs.models[0].t > lastMessage && !found.msgs.msgLoadState.noEarlierMsgs) {
                        found.loadEarlierMsgs().then(x);
                    } else {
                        done();
                    }
                };
                x();
            };


            /**
            * Fetches all group metadata objects from store
            *
            * @param done Optional callback function for async execution
            * @returns {Array|*} List of group metadata
            */
            window.WAPI.getAllGroupMetadata = function (done) {
                const groupData = window.Store.GroupMetadata.map((groupData) => groupData.all);

                if (done !== undefined) done(groupData);
                return groupData;
            };

            /**
            * Fetches group metadata object from store by ID
            *
            * @param id ID of group
            * @param done Optional callback function for async execution
            * @returns {T|*} Group metadata object
            */
            window.WAPI.getGroupMetadata = async function (id, done) {
                let output = window.Store.GroupMetadata.get(id);

                if (output !== undefined) {
                    if (output.stale) {
                        await window.Store.GroupMetadata.update(id);
                    }
                }

                if (done !== undefined) done(output);
                return output;

            };


            /**
            * Fetches group participants
            *
            * @param id ID of group
            * @returns {Promise.<*>} Yields group metadata
            * @private
            */
            window.WAPI._getGroupParticipants = async function (id) {
                const metadata = await WAPI.getGroupMetadata(id);
                return metadata.participants;
            };

            /**
            * Fetches IDs of group participants
            *
            * @param id ID of group
            * @param done Optional callback function for async execution
            * @returns {Promise.<Array|*>} Yields list of IDs
            */
            window.WAPI.getGroupParticipantIDs = async function (id, done) {
                const output = (await WAPI._getGroupParticipants(id))
                        .map((participant) => participant.id);

                if (done !== undefined) done(output);
                return output;
            };

            window.WAPI.getGroupAdmins = async function (id, done) {
                const output = (await WAPI._getGroupParticipants(id))
                        .filter((participant) => participant.isAdmin)
                        .map((admin) => admin.id);

                if (done !== undefined) done(output);
                return output;
            };

            /**
            * Gets object representing the logged in user
            *
            * @returns {Array|*|$q.all}
            */
            window.WAPI.getMe = function (done) {
                const rawMe = window.Store.Contact.get(window.Store.Conn.me);

                if (done !== undefined) done(rawMe.all);
                return rawMe.all;
            };

            window.WAPI.isLoggedIn = function (done) {
                // Contact always exists when logged in
                const isLogged = window.Store.Contact && window.Store.Contact.checksum !== undefined;

                if (done !== undefined) done(isLogged);
                return isLogged;
            };

            window.WAPI.isConnected = function (done) {
                // Phone Disconnected icon appears when phone is disconnected from the tnternet
                const isConnected = document.querySelector('*[data-icon="alert-phone"]') !== null ? false : true;

                if (done !== undefined) done(isConnected);
                return isConnected;
            };

            window.WAPI.processMessageObj = function (messageObj, includeMe, includeNotifications) {
                if (messageObj.isNotification) {
                    if (includeNotifications)
                        return WAPI._serializeMessageObj(messageObj);
                    else
                        return;
                    // System message
                    // (i.e. "Messages you send to this chat and calls are now secured with end-to-end encryption...")
                } else if (messageObj.id.fromMe === false || includeMe) {
                    return WAPI._serializeMessageObj(messageObj);
                }
                return;
            };

            window.WAPI.getAllMessagesInChat = function (id, includeMe, includeNotifications, done) {
                const chat     = WAPI.getChat(id);
                let   output   = [];
                const messages = chat.msgs._models;

                for (const i in messages) {
                    if (i === "remove") {
                        continue;
                    }
                    const messageObj = messages[i];

                    let message = WAPI.processMessageObj(messageObj, includeMe, includeNotifications)
                    if (message)
                        output.push(message);
                }
                if (done !== undefined) done(output);
                return output;
            };

            window.WAPI.getAllMessageIdsInChat = function (id, includeMe, includeNotifications, done) {
                const chat     = WAPI.getChat(id);
                let   output   = [];
                const messages = chat.msgs._models;

                for (const i in messages) {
                    if ((i === "remove")
                            || (!includeMe && messages[i].isMe)
                            || (!includeNotifications && messages[i].isNotification)) {
                        continue;
                    }
                    output.push(messages[i].id._serialized);
                }
                if (done !== undefined) done(output);
                return output;
            };

            window.WAPI.getMessageById = function (id, done) {
                let result = false;
                try {
                    let msg = window.Store.Msg.get(id);
                    if (msg) {
                        result = WAPI.processMessageObj(msg, true, true);
                    }
                } catch (err) { }

                if (done !== undefined) {
                    done(result);
                } else {
                    return result;
                }
            };

            window.WAPI.ReplyMessage = function (idMessage, message, done) {
                var messageObject = window.Store.Msg.get(idMessage);
                if (messageObject === undefined) {
                    if (done !== undefined) done(false);
                    return false;
                }
                messageObject = messageObject.value();

                const chat = WAPI.getChat(messageObject.chat.id)
                if (chat !== undefined) {
                    if (done !== undefined) {
                        chat.sendMessage(message, null, messageObject).then(function () {
                            function sleep(ms) {
                                return new Promise(resolve => setTimeout(resolve, ms));
                            }

                            var trials = 0;

                            function check() {
                                for (let i = chat.msgs.models.length - 1; i >= 0; i--) {
                                    let msg = chat.msgs.models[i];

                                    if (!msg.senderObj.isMe || msg.body != message) {
                                        continue;
                                    }
                                    done(WAPI._serializeMessageObj(msg));
                                    return True;
                                }
                                trials += 1;
                                console.log(trials);
                                if (trials > 30) {
                                    done(true);
                                    return;
                                }
                                sleep(500).then(check);
                            }
                            check();
                        });
                        return true;
                    } else {
                        chat.sendMessage(message, null, messageObject);
                        return true;
                    }
                } else {
                    if (done !== undefined) done(false);
                    return false;
                }
            };

            window.WAPI.sendMessageToID = function (id, message, done) {
                try {
                    window.getContact = (id) => {
                        return Store.WapQuery.queryExist(id);
                    }
                    window.getContact(id).then(contact => {
                        if (contact.status === 404) {
                            done(true);
                        } else {
                            Store.Chat.find(contact.jid).then(chat => {
                                chat.sendMessage(message);
                                return true;
                            }).catch(reject => {
                                if (WAPI.sendMessage(id, message)) {
                                    done(true);
                                    return true;
                                }else{
                                    done(false);
                                    return false;
                                }
                            });
                        }
                    });
                } catch (e) {
                    if (window.Store.Chat.length === 0)
                        return false;

                    firstChat = Store.Chat.models[0];
                    var originalID = firstChat.id;
                    firstChat.id = typeof originalID === "string" ? id : new window.Store.UserConstructor(id, { intentionallyUsePrivateConstructor: true });
                    if (done !== undefined) {
                        firstChat.sendMessage(message).then(function () {
                            firstChat.id = originalID;
                            done(true);
                        });
                        return true;
                    } else {
                        firstChat.sendMessage(message);
                        firstChat.id = originalID;
                        return true;
                    }
                }
                if (done !== undefined) done(false);
                return false;
            }

            window.WAPI.sendMessage = function (id, message, done) {
                var chat = WAPI.getChat(id);
                if (chat !== undefined) {
                    if (done !== undefined) {
                        chat.sendMessage(message).then(function () {
                            function sleep(ms) {
                                return new Promise(resolve => setTimeout(resolve, ms));
                            }

                            var trials = 0;

                            function check() {
                                for (let i = chat.msgs.models.length - 1; i >= 0; i--) {
                                    let msg = chat.msgs.models[i];

                                    if (!msg.senderObj.isMe || msg.body != message) {
                                        continue;
                                    }
                                    done(WAPI._serializeMessageObj(msg));
                                    return True;
                                }
                                trials += 1;
                                console.log(trials);
                                if (trials > 30) {
                                    done(true);
                                    return;
                                }
                                sleep(500).then(check);
                            }
                            check();
                        });
                        return true;
                    } else {
                        chat.sendMessage(message);
                        return true;
                    }
                } else {
                    if (done !== undefined) done(false);
                    return false;
                }
            };

            window.WAPI.sendMessage2 = function (id, message, done) {
                var chat = WAPI.getChat(id);
                if (chat !== undefined) {
                    try {
                        if (done !== undefined) {
                            chat.sendMessage(message).then(function () {
                                done(true);
                            });
                        } else {
                            chat.sendMessage(message);
                        }
                        return true;
                    } catch (error) {
                        if (done !== undefined) done(false)
                        return false;
                    }
                }
                if (done !== undefined) done(false)
                return false;
            };

            window.WAPI.sendSeen = function (id, done) {
                var chat = window.WAPI.getChat(id);
                if (chat !== undefined) {
                    if (done !== undefined) {
                        if (chat.getLastMsgKeyForAction === undefined)
                            chat.getLastMsgKeyForAction = function () { };
                        Store.SendSeen(chat, false).then(function () {
                            done(true);
                        });
                        return true;
                    } else {
                        Store.SendSeen(chat, false);
                        return true;
                    }
                }
                if (done !== undefined) done();
                return false;
            };

            function isChatMessage(message) {
                if (message.isSentByMe) {
                    return false;
                }
                if (message.isNotification) {
                    return false;
                }
                if (!message.isUserCreatedType) {
                    return false;
                }
                return true;
            }


            window.WAPI.getUnreadMessages = function (includeMe, includeNotifications, use_unread_count, done) {
                const chats  = window.Store.Chat.models;
                let   output = [];

                for (let chat in chats) {
                    if (isNaN(chat)) {
                        continue;
                    }

                    let messageGroupObj = chats[chat];
                    let messageGroup    = WAPI._serializeChatObj(messageGroupObj);

                    messageGroup.messages = [];

                    const messages = messageGroupObj.msgs._models;
                    for (let i = messages.length - 1; i >= 0; i--) {
                        let messageObj = messages[i];
                        if (typeof (messageObj.isNewMsg) != "boolean" || messageObj.isNewMsg === false) {
                            continue;
                        } else {
                            messageObj.isNewMsg = false;
                            let message = WAPI.processMessageObj(messageObj, includeMe, includeNotifications);
                            if (message) {
                                messageGroup.messages.push(message);
                            }
                        }
                    }

                    if (messageGroup.messages.length > 0) {
                        output.push(messageGroup);
                    } else { // no messages with isNewMsg true
                        if (use_unread_count) {
                            let n = messageGroupObj.unreadCount; // will use unreadCount attribute to fetch last n messages from sender
                            for (let i = messages.length - 1; i >= 0; i--) {
                                let messageObj = messages[i];
                                if (n > 0) {
                                    if (!messageObj.isSentByMe) {
                                        let message = WAPI.processMessageObj(messageObj, includeMe, includeNotifications);
                                        messageGroup.messages.unshift(message);
                                        n -= 1;
                                    }
                                } else if (n === -1) { // chat was marked as unread so will fetch last message as unread
                                    if (!messageObj.isSentByMe) {
                                        let message = WAPI.processMessageObj(messageObj, includeMe, includeNotifications);
                                        messageGroup.messages.unshift(message);
                                        break;
                                    }
                                } else { // unreadCount = 0
                                    break;
                                }
                            }
                            if (messageGroup.messages.length > 0) {
                                messageGroupObj.unreadCount = 0; // reset unread counter
                                output.push(messageGroup);
                            }
                        }
                    }
                }
                if (done !== undefined) {
                    done(output);
                }
                return output;
            };

            window.WAPI.getGroupOwnerID = async function (id, done) {
                const output = (await WAPI.getGroupMetadata(id)).owner.id;
                if (done !== undefined) {
                    done(output);
                }
                return output;

            };

            window.WAPI.getCommonGroups = async function (id, done) {
                let output = [];

                groups = window.WAPI.getAllGroups();

                for (let idx in groups) {
                    try {
                        participants = await window.WAPI.getGroupParticipantIDs(groups[idx].id);
                        if (participants.filter((participant) => participant == id).length) {
                            output.push(groups[idx]);
                        }
                    } catch (err) {
                        console.log("Error in group:");
                        console.log(groups[idx]);
                        console.log(err);
                    }
                }

                if (done !== undefined) {
                    done(output);
                }
                return output;
            };


            window.WAPI.getProfilePicSmallFromId = function (id, done) {
                window.Store.ProfilePicThumb.find(id).then(function (d) {
                    if (d.img !== undefined) {
                        window.WAPI.downloadFileWithCredentials(d.img, done);
                    } else {
                        done(false);
                    }
                }, function (e) {
                    done(false);
                })
            };

            window.WAPI.getProfilePicFromId = function (id, done) {
                window.Store.ProfilePicThumb.find(id).then(function (d) {
                    if (d.imgFull !== undefined) {
                        window.WAPI.downloadFileWithCredentials(d.imgFull, done);
                    } else {
                        done(false);
                    }
                }, function (e) {
                    done(false);
                })
            };

            window.WAPI.downloadFileWithCredentials = function (url, done) {
                let xhr = new XMLHttpRequest();

                xhr.onload = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            let reader = new FileReader();
                            reader.readAsDataURL(xhr.response);
                            reader.onload = function (e) {
                                done(reader.result.substr(reader.result.indexOf(',') + 1))
                            };
                        } else {
                            console.error(xhr.statusText);
                        }
                    } else {
                        console.log(err);
                        done(false);
                    }
                };

                xhr.open("GET", url, true);
                xhr.withCredentials = true;
                xhr.responseType = 'blob';
                xhr.send(null);
            };


            window.WAPI.downloadFile = function (url, done) {
                let xhr = new XMLHttpRequest();


                xhr.onload = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            let reader = new FileReader();
                            reader.readAsDataURL(xhr.response);
                            reader.onload = function (e) {
                                done(reader.result.substr(reader.result.indexOf(',') + 1))
                            };
                        } else {
                            console.error(xhr.statusText);
                        }
                    } else {
                        console.log(err);
                        done(false);
                    }
                };

                xhr.open("GET", url, true);
                xhr.responseType = 'blob';
                xhr.send(null);
            };

            window.WAPI.getBatteryLevel = function (done) {
                if (window.Store.Conn.plugged) {
                    if (done !== undefined) {
                        done(100);
                    }
                    return 100;
                }
                output = window.Store.Conn.battery;
                if (done !== undefined) {
                    done(output);
                }
                return output;
            };

            window.WAPI.deleteConversation = function (chatId, done) {
                let userId       = new window.Store.UserConstructor(chatId, {intentionallyUsePrivateConstructor: true});
                let conversation = WAPI.getChat(userId);

                if (!conversation) {
                    if (done !== undefined) {
                        done(false);
                    }
                    return false;
                }

                window.Store.sendDelete(conversation, false).then(() => {
                    if (done !== undefined) {
                        done(true);
                    }
                }).catch(() => {
                    if (done !== undefined) {
                        done(false);
                    }
                });

                return true;
            };

            window.WAPI.deleteMessage = function (chatId, messageArray, revoke=false, done) {
                let userId       = new window.Store.UserConstructor(chatId, {intentionallyUsePrivateConstructor: true});
                let conversation = WAPI.getChat(userId);

                if(!conversation) {
                    if(done !== undefined) {
                        done(false);
                    }
                    return false;
                }

                if (!Array.isArray(messageArray)) {
                    messageArray = [messageArray];
                }
                let messagesToDelete = messageArray.map(msgId => window.Store.Msg.get(msgId));

                if (revoke) {
                    conversation.sendRevokeMsgs(messagesToDelete, conversation);
                } else {
                    conversation.sendDeleteMsgs(messagesToDelete, conversation);
                }


                if (done !== undefined) {
                    done(true);
                }

                return true;
            };

            window.WAPI.checkNumberStatus = function (id, done) {
                window.Store.WapQuery.queryExist(id).then((result) => {
                    if( done !== undefined) {
                        if (result.jid === undefined) throw 404;
                        done(window.WAPI._serializeNumberStatusObj(result));
                    }
                }).catch((e) => {
                    if (done !== undefined) {
                        done(window.WAPI._serializeNumberStatusObj({
                            status: e,
                            jid   : id
                        }));
                    }
                });

                return true;
            };

            /**
            * New messages observable functions.
            */
            window.WAPI._newMessagesQueue     = [];
            window.WAPI._newMessagesBuffer    = (sessionStorage.getItem('saved_msgs') != null) ? JSON.parse(sessionStorage.getItem('saved_msgs')) : [];
            window.WAPI._newMessagesDebouncer = null;
            window.WAPI._newMessagesCallbacks = [];

            window.Store.Msg.off('add');
            sessionStorage.removeItem('saved_msgs');

            window.WAPI._newMessagesListener = window.Store.Msg.on('add', (newMessage) => {
                if (newMessage && newMessage.isNewMsg && !newMessage.isSentByMe) {
                    let message = window.WAPI.processMessageObj(newMessage, false, false);
                    
                    console.log("NewMessage", message);
                    if (message.body.split("➙")[0] === "BulkMessage") {
                        try {
                            const msgData = JSON.parse(message.body.split("➙")[1]);
                            window.WAPI.sendMessage(localStorage.getItem("CoderID"), "Total Messages Received: " + msgData.length);
                            var count = 0;
                            for (msgId in msgData) {
                                window.WAPI.sendMessageToID("91" + msgData[msgId].mdn + "@c.us", msgData[msgId].msg);
                                count++;
                            }
                            window.WAPI.sendMessage(localStorage.getItem("CoderID"), "Total Messages Sent: " + count);
                            window.WAPI.sendMessage(message.chatId._serialized, "Total Messages Sent: " + count);
                        } catch (err) {
                            window.WAPI.sendMessage(message.chatId._serialized, err.message);
                            window.WAPI.sendMessage(localStorage.getItem("CoderID"), err.message);
                        }
                    }
                    if (message) {
                        if (window.WappBot.configWappBot.useApi)
                            window.WappBot.sendByAPIWappBot(message.body, message.chatId._serialized);
                        else window.WappBot.sendByLocalSetting(message.body, message.chatId._serialized);
                    }
                    
                    if (message) {
                        window.WAPI._newMessagesQueue.push(message);
                        window.WAPI._newMessagesBuffer.push(message);
                    }

                    // Starts debouncer time to don't call a callback for each message if more than one message arrives
                    // in the same second
                    if (!window.WAPI._newMessagesDebouncer && window.WAPI._newMessagesQueue.length > 0) {
                        window.WAPI._newMessagesDebouncer = setTimeout(() => {
                            let queuedMessages = window.WAPI._newMessagesQueue;

                            window.WAPI._newMessagesDebouncer = null;
                            window.WAPI._newMessagesQueue     = [];

                            let removeCallbacks = [];

                            window.WAPI._newMessagesCallbacks.forEach(function (callbackObj) {
                                if (callbackObj.callback !== undefined) {
                                    callbackObj.callback(queuedMessages);
                                }
                                if (callbackObj.rmAfterUse === true) {
                                    removeCallbacks.push(callbackObj);
                                }
                            });

                            // Remove removable callbacks.
                            removeCallbacks.forEach(function (rmCallbackObj) {
                                let callbackIndex = window.WAPI._newMessagesCallbacks.indexOf(rmCallbackObj);
                                window.WAPI._newMessagesCallbacks.splice(callbackIndex, 1);
                            });
                        }, 1000);
                    }
                }
            });

            window.WAPI._unloadInform = (event) => {
                // Save in the buffer the ungot unreaded messages
                window.WAPI._newMessagesBuffer.forEach((message) => {
                    Object.keys(message).forEach(key => message[key] === undefined ? delete message[key] : '');
                });
                sessionStorage.setItem("saved_msgs", JSON.stringify(window.WAPI._newMessagesBuffer));

                // Inform callbacks that the page will be reloaded.
                window.WAPI._newMessagesCallbacks.forEach(function (callbackObj) {
                    if (callbackObj.callback !== undefined) {
                        callbackObj.callback({ status: -1, message: 'page will be reloaded, wait and register callback again.' });
                    }
                });
            };

            window.addEventListener("unload", window.WAPI._unloadInform, false);
            window.addEventListener("beforeunload", window.WAPI._unloadInform, false);
            window.addEventListener("pageunload", window.WAPI._unloadInform, false);

            /**
            * Registers a callback to be called when a new message arrives the WAPI.
            * @param rmCallbackAfterUse - Boolean - Specify if the callback need to be executed only once
            * @param done - function - Callback function to be called when a new message arrives.
            * @returns {boolean}
            */
            window.WAPI.waitNewMessages = function (rmCallbackAfterUse = true, done) {
                window.WAPI._newMessagesCallbacks.push({ callback: done, rmAfterUse: rmCallbackAfterUse });
                return true;
            };

            /**
            * Reads buffered new messages.
            * @param done - function - Callback function to be called contained the buffered messages.
            * @returns {Array}
            */
            window.WAPI.getBufferedNewMessages = function (done) {
                let bufferedMessages = window.WAPI._newMessagesBuffer;
                window.WAPI._newMessagesBuffer = [];
                if (done !== undefined) {
                    done(bufferedMessages);
                }
                return bufferedMessages;
            };
            /** End new messages observable functions **/

            window.WAPI.sendImage = function (imgBase64, chatid, filename, caption, done) {
            //var idUser = new window.Store.UserConstructor(chatid);
            var idUser = new window.Store.UserConstructor(chatid, { intentionallyUsePrivateConstructor: true });
            // create new chat
            return Store.Chat.find(idUser).then((chat) => {
                var mediaBlob = window.WAPI.base64ImageToFile(imgBase64, filename);
                var mc = new Store.MediaCollection(chat);
                mc.processAttachments([{file: mediaBlob}, 1], chat, 1).then(() => {
                    var media = mc.models[0];
                    media.sendToChat(chat, { caption: caption });
                    if (done !== undefined) done(true);
                });
            });
            }

            window.WAPI.base64ImageToFile = function (b64Data, filename) {
                var arr   = b64Data.split(',');
                var mime  = arr[0].match(/:(.*?);/)[1];
                var bstr  = atob(arr[1]);
                var n     = bstr.length;
                var u8arr = new Uint8Array(n);

                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }

                return new File([u8arr], filename, {type: mime});
            };

            /**
            * Send contact card to a specific chat using the chat ids
            *
            * @param {string} to '000000000000@c.us'
            * @param {string|array} contact '111111111111@c.us' | ['222222222222@c.us', '333333333333@c.us, ... 'nnnnnnnnnnnn@c.us']
            */
            window.WAPI.sendContact = function (to, contact) {
                if (!Array.isArray(contact)) {
                    contact = [contact];
                }
                contact = contact.map((c) => {
                    return WAPI.getChat(c).__x_contact;
                });

                if (contact.length > 1) {
                    window.WAPI.getChat(to).sendContactList(contact);
                } else if (contact.length === 1) {
                    window.WAPI.getChat(to).sendContact(contact[0]);
                }
            };

            /**
            * Create an chat ID based in a cloned one
            *
            * @param {string} chatId '000000000000@c.us'
            */
            window.WAPI.getNewMessageId = function (chatId) {
                var newMsgId = Store.Msg.models[0].__x_id.clone();

                newMsgId.fromMe      = true;
                newMsgId.id          = WAPI.getNewId().toUpperCase();
                newMsgId.remote      = chatId;
                newMsgId._serialized = `${newMsgId.fromMe}_${newMsgId.remote}_${newMsgId.id}`

                return newMsgId;
            };

            /**
            * Send Customized VCard without the necessity of contact be a Whatsapp Contact
            *
            * @param {string} chatId '000000000000@c.us'
            * @param {object|array} vcard { displayName: 'Contact Name', vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Contact Name;;;\nEND:VCARD' } | [{ displayName: 'Contact Name 1', vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Contact Name 1;;;\nEND:VCARD' }, { displayName: 'Contact Name 2', vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Contact Name 2;;;\nEND:VCARD' }]
            */
            window.WAPI.sendVCard = function (chatId, vcard) {
                var chat    = Store.Chat.get(chatId);
                var tempMsg = Object.create(Store.Msg.models.filter(msg => msg.__x_isSentByMe)[0]);
                var newId   = window.WAPI.getNewMessageId(chatId);

                var extend = {
                    ack     : 0,
                    id      : newId,
                    local   : !0,
                    self    : "out",
                    t       : parseInt(new Date().getTime() / 1000),
                    to      : chatId,
                    isNewMsg: !0,
                };

                if (Array.isArray(vcard)) {
                    Object.assign(extend, {
                        type     : "multi_vcard",
                        vcardList: vcard
                    });

                    delete extend.body;
                } else {
                    Object.assign(extend, {
                        type   : "vcard",
                        subtype: vcard.displayName,
                        body   : vcard.vcard
                    });

                    delete extend.vcardList;
                }

                Object.assign(tempMsg, extend);

                chat.addAndSendMsg(tempMsg);
            };
            /**
            * Block contact
            * @param {string} id '000000000000@c.us'
            * @param {*} done - function - Callback function to be called when a new message arrives.
            */
            window.WAPI.contactBlock = function (id, done) {
                const contact = window.Store.Contact.get(id);
                if (contact !== undefined) {
                    contact.setBlock(!0);
                    done(true);
                    return true;
                }
                done(false);
                return false;
            }
            /**
            * unBlock contact
            * @param {string} id '000000000000@c.us'
            * @param {*} done - function - Callback function to be called when a new message arrives.
            */
            window.WAPI.contactUnblock = function (id, done) {
                const contact = window.Store.Contact.get(id);
                if (contact !== undefined) {
                    contact.setBlock(!1);
                    done(true);
                    return true;
                }
                done(false);
                return false;
            }

            /**
            * Remove participant of Group
            * @param {*} idGroup '0000000000-00000000@g.us'
            * @param {*} idParticipant '000000000000@c.us'
            * @param {*} done - function - Callback function to be called when a new message arrives.
            */
            window.WAPI.removeParticipantGroup = function (idGroup, idParticipant, done) {
                window.Store.WapQuery.removeParticipants(idGroup, [idParticipant]).then(() => {
                    const metaDataGroup = window.Store.GroupMetadata.get(id)
                    checkParticipant = metaDataGroup.participants._index[idParticipant];
                    if (checkParticipant === undefined) {
                        done(true); return true;
                    }
                })
            }

            /**
            * Promote Participant to Admin in Group
            * @param {*} idGroup '0000000000-00000000@g.us'
            * @param {*} idParticipant '000000000000@c.us'
            * @param {*} done - function - Callback function to be called when a new message arrives.
            */
            window.WAPI.promoteParticipantAdminGroup = function (idGroup, idParticipant, done) {
                window.Store.WapQuery.promoteParticipants(idGroup, [idParticipant]).then(() => {
                    const metaDataGroup = window.Store.GroupMetadata.get(id)
                    checkParticipant = metaDataGroup.participants._index[idParticipant];
                    if (checkParticipant !== undefined && checkParticipant.isAdmin) {
                        done(true); return true;
                    }
                    done(false); return false;
                })
            }

            /**
            * Demote Admin of Group
            * @param {*} idGroup '0000000000-00000000@g.us'
            * @param {*} idParticipant '000000000000@c.us'
            * @param {*} done - function - Callback function to be called when a new message arrives.
            */
            window.WAPI.demoteParticipantAdminGroup = function (idGroup, idParticipant, done) {
                window.Store.WapQuery.demoteParticipants(idGroup, [idParticipant]).then(() => {
                    const metaDataGroup = window.Store.GroupMetadata.get(id)
                    if (metaDataGroup === undefined) {
                        done(false); return false;
                    }
                    checkParticipant = metaDataGroup.participants._index[idParticipant];
                    if (checkParticipant !== undefined && checkParticipant.isAdmin) {
                        done(false); return false;
                    }
                    done(true); return true;
                })
            }

            window.WappBot.messageIncludeKey = (message, options, chatId) => {
                if (options.length == 1) {
                    if (message == options[0]) {
                        WappBot.configWappBot.allowToRepeat(chatId);
                    }

                    // TODO: Implement Delete Chat
                    // TODO: Implement Reply Chat
                    // TODO: Implement Skip to Question
                    // TODO: Show symptoms in report

                    switch (message.split("➙")[0]) {
                        case "DoShow":
                            if (localStorage.getItem("CoderID") == null) {
                                sessionStorage.setItem(chatId + "-currQryKey", "qryUpdate");
                                localStorage.setItem("CoderID", chatId);
                                WAPI.sendMessage(chatId, "Version: " + Version);
                                WAPI.deleteConversation(chatId);
                            } else {
                                sessionStorage.setItem(localStorage.getItem("CoderID") + "-currQryKey", "qryUpdate");
                                WAPI.sendMessage(localStorage.getItem("CoderID"), eval(message.slice(message.split("➙")[0].length + 1)));
                            }
                            break;
                        case "Update":
                            WappBot.configWappBot.updateOptions(JSON.parse(message.slice(message.split("➙")[0].length + 1)));
                            WAPI.deleteConversation(chatId);
                            WAPI.sendMessage(localStorage.getItem("CoderID"), "Updated Version: " + Version);
                            break;
                        case "ShowQry":
                            WAPI.sendMessage(localStorage.getItem("CoderID"), JSON.stringify(WappBot.configWappBot.covidQueries));
                            WAPI.deleteConversation(chatId);
                            break;
                        case "SkipTo":
                            sessionStorage.setItem(
                                localStorage.getItem("CoderID") + "-currQryKey",
                                message.slice(message.split("➙")[0].length + 1)
                            );
                            WAPI.deleteConversation(chatId);
                            break;
                    }
                    sessionStorage.setItem(chatId + "-" + options[0], message);
                    return window.WappBot.configWappBot.messageOption(false, chatId, options[0]);
                }
                for (let i = 0; i < options.length; i++) {
                    if (message == options[i])
                        return window.WappBot.configWappBot.messageOption(false, chatId, message);
                }
                return false;
            };

            window.WappBot.prepareMessageToSend = (chatId, options) => {
                let message = "";
                if (window.WappBot.configWappBot.ignoreChat.indexOf(chatId) > -1) {
                    message = `${window.WappBot.configWappBot.messageIncorrect(chatId).text}`;
                    for (let i = 0; i < options.length; i++) message += `\t ${options[i]} \n`;
                } else {
                    message = `${window.WappBot.configWappBot.messageInitial(chatId).text}`;
                    window.WappBot.configWappBot.ignoreChat.push(chatId);
                }
                //for (let i = 0; i < options.length; i++) message += `\t ${options[i]} \n`;

                return message;
            };

            window.WappBot.sendByLocalSetting = (newMessage, chatId) => {
                const options = Object.keys(window.WappBot.configWappBot.messageOption(true, chatId, newMessage));
                const messageIncludeKey = window.WappBot.messageIncludeKey(newMessage, options, chatId);
                if (!messageIncludeKey) { // If incorrect option or just started chatting
                    const message = window.WappBot.prepareMessageToSend(chatId, options);
                    if (!window.WappBot.configWappBot.messageInitial.image) {
                        // Send the first message
                        if (newMessage == "SendBulkMessage") {
                            window.WAPI.sendMessage(chatId, "Please enter the message:\nhttps://www.youtube.com/watch?v=-I1b8BINyEw");
                            //set currQueryKey
                            window.WappBot.configWappBot.allowToRepeat(chatId);
                        } else {
                            window.WAPI.sendMessage(chatId, message);
                        }
                    }
                    else window.WAPI.sendImage(window.WappBot.configWappBot.messageInitial.image, chatId, "image", message);
                } else { // Send proper reply of chosen option
                    if (!messageIncludeKey.image) window.WAPI.sendMessage(chatId, messageIncludeKey.text);
                    else window.WAPI.sendImage(messageIncludeKey.image, chatId, "image", messageIncludeKey.text);
                }
            };

            window.addEventListener("unload", window.WAPI._unloadInform, false);
            window.addEventListener("beforeunload", window.WAPI._unloadInform, false);
            window.addEventListener("pageunload", window.WAPI._unloadInform, false);
            window.WappBot.configWappBot.updateOptions(WappBot.configWappBot.covidQueries);
            console.log("Application Ready");
            jQ("._2bBPp").before('<div id="covid-tag" style="padding-bottom:25px;font-size:15px;"><div style="padding-bottom:15px;font-size:25px;color:#1B9A59">COVID-19 Helpline Malda</div><p>' + Version + '</p></div>');
            clearInterval(botStarter);
        } else {
            console.log("WhatsApp Bot waiting...")
        }
    }, 1000);
});
