// ==UserScript==
// @name         COVID-19-WhatsApp-Web-Bot
// @namespace    https://github.com/abusalam
// @version      0.0.62
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
            + 'var Version = "v0.0.62";'
            + '(' + callback.toString() + ')();';
        document.body.appendChild(UserScript);
    }, false);
    document.body.appendChild(jQueryScript);
}

/* eslint-disable */

jQueryInclude(function () {
    jQ(".xZ93f").text("Welcome to TeleMedinicine Helpline, Malda");

    setTimeout(function () {

        setInterval(function () {
            if (!jQ("#covid-tag").length) {
                if (jQ("._5SiUq").length) {
                    jQ("._5SiUq").after('<span id="covid-tag">COVID-19 Helpline Malda ' + Version + '</span>');
                } else {
                    jQ(".P8cO8").before('<div style="padding-top:20px" id="covid-tag">COVID-19 Helpline Malda ' + Version + '</div>');
                }
            }
        }, 2000);

        window.WappBot = {
            configWappBot: {
                useApi: false,
                uriApi: "https://wapp-bot.herokuapp.com/message",
                ignoreChat: [],
                messageInitial: {
                    text: "Welcome to Malda Telemedicine Helpline [ Version: " + Version + " ] \nমালদা টেলিমেডিসিন হেল্পলাইনে আপনাকে স্বাগতম\n"
                        + "Please reply with 1 or 2 to continue...\nদয়া করে 1 বা 2 দিয়ে উত্তর দিন\n"
                        + "1 ➙ English\n2 ➙ বাংলা\n",
                    image: null //"https://pmrpressrelease.com/wp-content/uploads/2019/05/Telehealth-1.jpg"
                },
                messageIncorrect: "Incorrect option, please reply with: \nভুল বিকল্প, দয়া করে এর সাথে উত্তর দিন:\n",

                messageOption: (sendOption, msgId, newMessage) => {

                    let covidQueries = {
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
                        "qryLang": {
                            ask: "Please Select language\nভাষা নির্বাচন করুন\n"
                                + "1. English\n2. বাংলা\n",
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
                                "1": "qryFeverDays",
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
                                "1": "qryFeverDaysBn",
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
                                "1": "qryCoughSince",
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
                                "1": "qryCoughSinceBn",
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
                            ask: "আপনার কি শ্বাসকষ্ট আছে?\n"
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
                                "1": "qryAbdomainPain",
                                "2": "qryAbdomainPain",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },

                        "qryDiarrheaBn": {
                            ask: "আপনার কি পাতলা পায়খানা আছে?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryAbdomainPainBn",
                                "2": "qryAbdomainPainBn"
                            },
                            scores: {
                                "1": 2,
                                "2": 0
                            }
                        },

                        "qryAbdomainPain": {
                            ask: "Do you have abdominal pain?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qryDiabetes",
                                "2": "qryDiabetes",
                            },
                            scores: {
                                "1": 1,
                                "2": 0,
                            }
                        },

                        "qryAbdomainPainBn": {
                            ask: "আপনার কি পেট ব্যথা আছে?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryDiabetesBn",
                                "2": "qryDiabetesBn"
                            },
                            scores: {
                                "1": 1,
                                "2": 0
                            }
                        },

                        "qryDiabetes": {
                            ask: "Are you suffering from diabetes?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qryHypertension",
                                "2": "qryHypertension",
                            },
                            scores: {
                                "1": 1,
                                "2": 0,
                            }
                        },

                        "qryDiabetesBn": {
                            ask: "আপনি কি ডায়াবেটিস রোগে ভুগছেন?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryHypertensionBn",
                                "2": "qryHypertensionBn"
                            },
                            scores: {
                                "1": 1,
                                "2": 0
                            }
                        },

                        "qryHypertension": {
                            ask: "Are you suffering from Hypertension?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qryLung",
                                "2": "qryLung",
                            },
                            scores: {
                                "1": 1,
                                "2": 0,
                            }
                        },

                        "qryHypertensionBn": {
                            ask: "আপনি কি উচ্চ রক্তচাপ রোগে ভুগছেন?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryLungBn",
                                "2": "qryLungBn"
                            },
                            scores: {
                                "1": 1,
                                "2": 0
                            }
                        },

                        "qryLung": {
                            ask: "Are you suffering from Lung disease?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qryHeart",
                                "2": "qryHeart",
                            },
                            scores: {
                                "1": 1,
                                "2": 0,
                            }
                        },

                        "qryLungBn": {
                            ask: "আপনি কি ফুসফুসের রোগে ভুগছেন?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryHeartBn",
                                "2": "qryHeartBn"
                            },
                            scores: {
                                "1": 1,
                                "2": 0
                            }
                        },

                        "qryHeart": {
                            ask: "Are you suffering from Heart disease?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qryImmunity",
                                "2": "qryImmunity",
                            },
                            scores: {
                                "1": 1,
                                "2": 0,
                            }
                        },

                        "qryHeartBn": {
                            ask: "আপনি কি হৃদরোগে ভুগছেন?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryImmunityBn",
                                "2": "qryImmunityBn"
                            },
                            scores: {
                                "1": 1,
                                "2": 0
                            }
                        },

                        "qryImmunity": {
                            ask: "Are you suffering from Immunity disorder?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qrySteroid",
                                "2": "qrySteroid",
                            },
                            scores: {
                                "1": 1,
                                "2": 0,
                            }
                        },

                        "qryImmunityBn": {
                            ask: "আপনি কি রোগ প্রতিরোধ ক্ষমতা কমের ব্যাধিতে ভুগছেন?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qrySteroidBn",
                                "2": "qrySteroidBn"
                            },
                            scores: {
                                "1": 1,
                                "2": 0
                            }
                        },

                        "qrySteroid": {
                            ask: "Are you taking Steroids regularly as treatment?\n"
                                + "1 ➙ Yes\n"
                                + "2 ➙ No",
                            options: {
                                "1": "qryTravelState",
                                "2": "qryTravelState",
                            },
                            scores: {
                                "1": 1,
                                "2": 0,
                            }
                        },
                        "qrySteroidBn": {
                            ask: "আপনি কি চিকিৎসা হিসাবে নিয়মিত স্টেরয়েড গ্রহণ করেন?\n"
                                + "1 ➙ হ্যাঁ\n"
                                + "2 ➙ না",
                            options: {
                                "1": "qryTravelStateBn",
                                "2": "qryTravelStateBn"
                            },
                            scores: {
                                "1": 1,
                                "2": 0
                            }
                        },
                        "qryTravelState": {
                            ask: "Have you visited another state in last 14 days?\n"
                                + "1 ➙ Yes\n2 ➙ No\n",
                            options: {
                                "1": "qryTravelDistrict",
                                "2": "qryTravelDistrict",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },
                        "qryTravelStateBn": {
                            ask: "আপনি কি গত ১৪ দিনে অন্য কোনও রাজ্যে গিয়েছেন?\n"
                                + "1 ➙ হ্যাঁ\n2 ➙ না\n",
                            options: {
                                "1": "qryTravelDistrictBn",
                                "2": "qryTravelDistrictBn",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },
                        "qryTravelDistrict": {
                            ask: "Have you visited any other district of WB in last 14 days?\n"
                                + "1 ➙ Yes\n2 ➙ No\n",
                            options: {
                                "1": "qryTravelHotSpot",
                                "2": "qryTravelHotSpot",
                            },
                            scores: {
                                "1": 1,
                                "2": 0,
                            }
                        },

                        "qryTravelDistrictBn": {
                            ask: "আপনি কি গত ১৪ দিনের মধ্যে পশ্চিমবঙ্গের অন্য কোনও জেলায় গিয়েছেন?\n"
                                + "1 ➙ হ্যাঁ\n2 ➙ না\n",
                            options: {
                                "1": "qryTravelHotSpotBn",
                                "2": "qryTravelHotSpotBn",
                            },
                            scores: {
                                "1": 1,
                                "2": 0,
                            }
                        },

                        "qryTravelHotSpot": {
                            ask: "Have you visited any Hot spot in last 14 days?\n"
                                + "1 ➙ Yes\n2 ➙ No\n",
                            options: {
                                "1": "qryContact",
                                "2": "qryContact",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },

                        "qryTravelHotSpotBn": {
                            ask: "আপনি কি গত ১৪ দিনে কোনও হটস্পটে গিয়েছেন?\n"
                                + "1 ➙ হ্যাঁ\n2 ➙ না\n",
                            options: {
                                "1": "qryContactBn",
                                "2": "qryContactBn",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },

                        "qryContact": {
                            ask: "Have you come in contact with any Corona affected person(s) in last 14 days?\n"
                                + "1 ➙ Yes\n2 ➙ No\n",
                            options: {
                                "1": "qryHCP",
                                "2": "qryHCP",
                            },
                            scores: {
                                "1": 5,
                                "2": 0,
                            }
                        },
                        "qryContactBn": {
                            ask: "আপনি কি গত ১৪ দিনে কোনও করোনায় আক্রান্ত রোগীর সংস্পর্শে এেসেছন?\n"
                                + "1 ➙ হ্যাঁ\n2 ➙ না\n",
                            options: {
                                "1": "qryHCPBn",
                                "2": "qryHCPBn",
                            },
                            scores: {
                                "1": 5,
                                "2": 0,
                            }
                        },
                        "qryHCP": {
                            ask: "Are you a Health Care Provider?\n"
                                + "1 ➙ Yes\n2 ➙ No\n",
                            options: {
                                "1": "qryFinished",
                                "2": "qryFinished",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },

                        "qryHCPBn": {
                            ask: "আপনি কি স্বাস্থ্য পরিষেবার সাথে যুক্ত?\n"
                                + "1 ➙ হ্যাঁ\n2 ➙ না\n",
                            options: {
                                "1": "qryFinishedBn",
                                "2": "qryFinishedBn",
                            },
                            scores: {
                                "1": 2,
                                "2": 0,
                            }
                        },

                        "qryFinished": {
                            ask: "Please note that information from this chat will be used for monitoring & management of the current health crisis and research in the fight against COVID-19. Accurate answers help us- help you better. Medical and support staff are valuable and very limited. Be a responsible citizen\n"
                                + "1 ➙ I have given accurate answers\n"
                                + "2 ➙ Try again with accurate answers",
                            options: {
                                "1": "qryClosingReport",
                                "2": "qryLang",
                            },
                            scores: {
                                "1": 0,
                                "2": 0,
                            }
                        },
                        "qryFinishedBn": {
                            ask: "সঠিক উত্তরগুলি আমাদের সহায়তা করে - আপনাকে আরও ভালভাবে সহায়তা করতে। চিকিৎসা এবং সহায়তা কর্মীরা মূল্যবান এবং খুব সীমাবদ্ধ। একজন দায়িত্বশীল নাগরিক হন।\n"
                                + "1 ➙ আমি সঠিক উত্তর দিয়েছি\n"
                                + "2 ➙ সঠিক উত্তর দিয়ে আবার চেষ্টা করি",
                            options: {
                                "1": "qryClosingReportBn",
                                "2": "qryLang",
                            },
                            scores: {
                                "1": 0,
                                "2": 0,
                            }
                        },
                        "qryClosingReport": {
                            ask: "\n Version: " + Version + "\n Thank you for your kind support. \n",
                            options: {
                                "Done": "qryClosingReport"
                            },
                            scores: {
                                "Done": 0
                            }
                        },
                        "qryClosingReportBn": {
                            ask: "\n Version: " + Version + "\n আপনার সহযোগিতার জন্য ধন্যবাদ।",
                            options: {
                                "Done": "qryClosingReportBn"
                            },
                            scores: {
                                "Done": 0
                            }
                        },
                    };

                    for (let qryKey in covidQueries) {
                        sessionStorage.setItem("covidQuery_" + qryKey, JSON.stringify(covidQueries[qryKey]));
                    }


                    let currQryKey = sessionStorage.getItem(msgId + "currQryKey");

                    if (currQryKey == null) {
                        currQryKey = "qryApp";
                        if (!sendOption) sessionStorage.setItem(msgId + "currQryKey", "qryApp");
                        console.log("currQryKey set = " + sessionStorage.getItem(msgId + "currQryKey"));
                    } else {
                        console.log("currQryKey get = " + currQryKey);
                    }

                    let storageQryKey = "covidQuery_" + currQryKey;

                    console.log("storageQryKey = " + storageQryKey);

                    console.log("126-storage-get:" + sessionStorage.getItem(storageQryKey));

                    let currQry = JSON.parse(sessionStorage.getItem("covidQuery_" + currQryKey));

                    console.log({ "127-msgID": msgId, "currQry": currQry });


                    if (sendOption) { //Prepare Options to be asked
                        currOptions = currQry.options;
                    } else { //Prepare Question to be asked

                        // Get Score for currentAnswer
                        let currScore = sessionStorage.getItem(msgId + "-Score");
                        if (currScore == null) currScore = 0;
                        // End of Update Score for currentAnswer

                        console.log({ "131-currQry-new-option": currQry.options[newMessage] });
                        let nextQryKey = currQry.options[newMessage];
                        if (nextQryKey !== undefined) {
                            sessionStorage.setItem(msgId + "currQryKey", nextQryKey);

                            // Update Score for currentAnswer
                            currScore = parseInt(currQry.scores[newMessage]) + parseInt(currScore);
                            if (nextQryKey == "qryLang") currScore = 0;
                            sessionStorage.setItem(msgId + "-Score", currScore);
                            console.log({ "131-currQry-new-score": currQry.scores[newMessage] });
                            // End of Update Score for currentAnswer
                        }
                        console.log("Asking:" + JSON.parse(sessionStorage.getItem("covidQuery_" + currQry.options[newMessage])).ask);
                        currOptions = {
                            text: "Score: " + sessionStorage.getItem(msgId + "-Score") + "\n" + JSON.parse(sessionStorage.getItem("covidQuery_" + currQry.options[newMessage])).ask,
                            image: null
                        };
                    }

                    console.log("Got " + currQryKey + "=>" + sessionStorage.getItem(msgId + "currQryKey") + " sendOption: (" + sendOption + "), msgId: (" + msgId + '), newMessage: (' + newMessage + ')');

                    return currOptions;
                }
            }
        };


        /* eslint-disable */
        /**
         * This script contains WAPI functions that need to be run in the context of the webpage
         */

        /**
         * Auto discovery the webpack object references of instances that contains all functions used by the WAPI
         * functions and creates the Store object.
         */
        if (!window["webpackJsonp"]) {
            window.webpackJsonp = webpackJsonp;
        }

        if (!window.Store) {
            (function () {
                function getStore(modules) {
                    let foundCount = 0;
                    let neededObjects = [
                        { id: "Store", conditions: (module) => (module.Chat && module.Msg) ? module : null },
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
                                }
                                return window.Store;
                            }
                        }
                    }
                }

                // webpackJsonp([], { 'parasite': (x, y, z) => getStore(z) }, ['parasite']);

                /**
                 * Code update
                 */
                if (typeof webpackJsonp === 'function') {
                    webpackJsonp([], { 'parasite': (x, y, z) => getStore(z) }, ['parasite']);
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

        window.WAPI._serializeRawObj = obj => {
            if (obj) {
                return obj.toJSON();
            }
            return {};
        };

        /**
         * Serializes a chat object
         *
         * @param rawChat Chat object
         * @returns {{}}
         */

        window.WAPI._serializeChatObj = obj => {
            if (obj == undefined) {
                return null;
            }

            return Object.assign(window.WAPI._serializeRawObj(obj), {
                kind: obj.kind,
                isGroup: obj.isGroup,
                contact: obj["contact"] ? window.WAPI._serializeContactObj(obj["contact"]) : null,
                groupMetadata: obj["groupMetadata"] ? window.WAPI._serializeRawObj(obj["groupMetadata"]) : null,
                presence: obj["presence"] ? window.WAPI._serializeRawObj(obj["presence"]) : null,
                msgs: null
            });
        };

        window.WAPI._serializeContactObj = obj => {
            if (obj == undefined) {
                return null;
            }

            return Object.assign(window.WAPI._serializeRawObj(obj), {
                formattedName: obj.formattedName,
                isHighLevelVerified: obj.isHighLevelVerified,
                isMe: obj.isMe,
                isMyContact: obj.isMyContact,
                isPSA: obj.isPSA,
                isUser: obj.isUser,
                isVerified: obj.isVerified,
                isWAContact: obj.isWAContact,
                profilePicThumbObj: obj.profilePicThumb ? WAPI._serializeProfilePicThumb(obj.profilePicThumb) : {},
                statusMute: obj.statusMute,
                msgs: null
            });
        };

        window.WAPI._serializeMessageObj = obj => {
            if (obj == undefined) {
                return null;
            }

            return Object.assign(window.WAPI._serializeRawObj(obj), {
                id: obj.id._serialized,
                sender: obj["senderObj"] ? WAPI._serializeContactObj(obj["senderObj"]) : null,
                timestamp: obj["t"],
                content: obj["body"],
                isGroupMsg: obj.isGroupMsg,
                isLink: obj.isLink,
                isMMS: obj.isMMS,
                isMedia: obj.isMedia,
                isNotification: obj.isNotification,
                isPSA: obj.isPSA,
                type: obj.type,
                chat: WAPI._serializeChatObj(obj["chat"]),
                chatId: obj.id.remote,
                quotedMsgObj: WAPI._serializeMessageObj(obj["_quotedMsgObj"]),
                mediaData: window.WAPI._serializeRawObj(obj["mediaData"])
            });
        };

        window.WAPI._serializeNumberStatusObj = obj => {
            if (obj == undefined) {
                return null;
            }

            return Object.assign(
                {},
                {
                    id: obj.jid,
                    status: obj.status,
                    isBusiness: obj.biz === true,
                    canReceiveMessage: obj.status === 200
                }
            );
        };

        window.WAPI._serializeProfilePicThumb = obj => {
            if (obj == undefined) {
                return null;
            }

            return Object.assign(
                {},
                {
                    eurl: obj.eurl,
                    id: obj.id,
                    img: obj.img,
                    imgFull: obj.imgFull,
                    raw: obj.raw,
                    tag: obj.tag
                }
            );
        };

        /**
         * Fetches chat object from store by ID
         *
         * @param id ID of chat
         * @returns {T|*} Chat object
         */
        window.WAPI.getChat = function (id) {
            id = typeof id == "string" ? id : id._serialized;
            const found = window.Store.Chat.get(id);
            found.sendMessage = found.sendMessage
                ? found.sendMessage
                : function () {
                    return window.Store.sendMessage.apply(this, arguments);
                };
            return found;
        };

        /**
         * Fetches all chat IDs from store
         *
         * @returns {Array|*} List of chat id's
         */
        window.WAPI.getAllChatIds = function () {
            const chatIds = window.Store.Chat.map(chat => chat.id._serialized || chat.id);
            return chatIds;
        };

        window.WAPI.processMessageObj = function (messageObj, includeMe, includeNotifications) {
            if (messageObj.isNotification) {
                if (includeNotifications) return WAPI._serializeMessageObj(messageObj);
                else return;
                // System message
                // (i.e. "Messages you send to this chat and calls are now secured with end-to-end encryption...")
            } else if (messageObj.id.fromMe === false || includeMe) {
                return WAPI._serializeMessageObj(messageObj);
            }
            return;
        };

        window.WAPI.sendImage = async function (imgBase64, chatid, filename, caption) {
            let id = chatid;
            if (!window.WAPI.getAllChatIds().find(chat => chat == chatid))
                id = new window.Store.UserConstructor(chatid, { intentionallyUsePrivateConstructor: true });
            var chat = WAPI.getChat(id);
            // create new chat
            try {
                var mediaBlob = await window.WAPI.base64ImageToFile(imgBase64, filename);
                var mc = new Store.MediaCollection(chat);
                mc.processFiles([mediaBlob], chat, 1).then(() => {
                    var media = mc.models[0];
                    media.sendToChat(chat, { caption: caption });
                });
            } catch (error) {
                if (window.Store.Chat.length === 0) return false;

                let firstChat = Store.Chat.models[0];
                let originalID = firstChat.id;
                firstChat.id =
                    typeof originalID === "string"
                        ? id
                        : new window.Store.UserConstructor(id, { intentionallyUsePrivateConstructor: true });
                let mediaBlob = await window.WAPI.base64ImageToFile(imgBase64, filename);
                var mc = new Store.MediaCollection(chat);
                chat = WAPI.getChat(id);
                mc.processAttachments([{ file: mediaBlob }, 1], chat, 1).then(() => {
                    let media = mc.models[0];
                    media.sendToChat(chat, { caption: caption });
                });
                return true;
            }
        };

        window.WAPI.base64ImageToFile = function (image, filename) {
            return new Promise(async resolve => {
                if (!image.includes("base64")) {
                    image = await window.WappBot.toDataURL("https://cors-anywhere.herokuapp.com/" + image); // convert url in base64
                }
                var arr = image.split(","),
                    mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]),
                    n = bstr.length,
                    u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                resolve(new File([u8arr], filename, { type: mime }));
            });
        };

        window.WAPI.sendMessage = function (idChat, message) {
            let id = idChat;
            if (!window.WAPI.getAllChatIds().find(chat => chat == idChat))
                id = new window.Store.UserConstructor(idChat, { intentionallyUsePrivateConstructor: true });
            var chat = WAPI.getChat(id);
            try {
                // create new chat
                return chat.sendMessage(message);
            } catch (e) {
                if (window.Store.Chat.length === 0) return false;

                firstChat = Store.Chat.models[0];
                var originalID = firstChat.id;
                firstChat.id =
                    typeof originalID === "string"
                        ? id
                        : new window.Store.UserConstructor(id, { intentionallyUsePrivateConstructor: true });
                var chat = WAPI.getChat(firstChat.id);
                chat.sendMessage(message);
                return true;
            }
        };

        window.WappBot.toDataURL = url => {
            return new Promise(resolve => {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        resolve(reader.result);
                    };
                    reader.readAsDataURL(xhr.response);
                };
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.send();
            });
        };

        window.WappBot.sendByAPIWappBot = (newMessage, chatId) => {
            fetch(window.WappBot.configWappBot.uriApi, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ messageText: newMessage })
            }).then(function (response) {
                response.json().then(post => {
                    if (!post && !post.messageResponse) return;
                    window.WAPI.sendMessage(chatId, post.messageResponse);
                });
            });
        };

        window.WappBot.messageIncludeKey = (message, options, chatId) => {
            console.log({ "msgIncludeKey": options });
            if (options.length == 1) {
                if (message == options[0]) {
                    delete window.WappBot.configWappBot.ignoreChat[window.WappBot.configWappBot.ignoreChat.indexOf(chatId)];
                    sessionStorage.removeItem(chatId + "currQryKey");
                    sessionStorage.setItem(chatId + "-Score", 0);
                }
                return window.WappBot.configWappBot.messageOption(false, chatId, options[0]);
            }
            for (let i = 0; i < options.length; i++) {
                if (message.toUpperCase().includes(options[i].toUpperCase()))
                    return window.WappBot.configWappBot.messageOption(false, chatId, message);
            }
            console.log("Incorrect Option");
            return false;
        };

        window.WappBot.prepareMessageToSend = (chatId, options) => {
            let message = "";
            if (window.WappBot.configWappBot.ignoreChat.indexOf(chatId) > -1) {
                message = `${window.WappBot.configWappBot.messageIncorrect}`;
                for (let i = 0; i < options.length; i++) message += `\t ${options[i]} \n`;
            } else {
                message = `${window.WappBot.configWappBot.messageInitial.text}`;
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
                    window.WAPI.sendMessage(chatId, message);
                    //window.WappBot.sendByLocalSetting(newMessage, chatId);
                }
                else window.WAPI.sendImage(window.WappBot.configWappBot.messageInitial.image, chatId, "image", message);
            } else { // Send proper reply of chosen option
                if (!messageIncludeKey.image) window.WAPI.sendMessage(chatId, messageIncludeKey.text);
                else window.WAPI.sendImage(messageIncludeKey.image, chatId, "image", messageIncludeKey.text);
            }
        };

        /**
         * New messages observable functions.
         */
        window.WAPI._newMessagesQueue = [];
        window.WAPI._newMessagesBuffer =
            sessionStorage.getItem("saved_msgs") != null ? JSON.parse(sessionStorage.getItem("saved_msgs")) : [];
        window.WAPI._newMessagesDebouncer = null;
        window.WAPI._newMessagesCallbacks = [];

        window.Store.Msg.off("add");
        sessionStorage.removeItem("saved_msgs");

        window.WAPI._newMessagesListener = window.Store.Msg.on("add", newMessage => {
            if (newMessage && newMessage.isNewMsg && !newMessage.isSentByMe) {
                let message = window.WAPI.processMessageObj(newMessage, false, false);
                if (message) {
                    if (window.WappBot.configWappBot.useApi)
                        window.WappBot.sendByAPIWappBot(message.body, message.chatId._serialized);
                    else window.WappBot.sendByLocalSetting(message.body, message.chatId._serialized);
                }
            }
        });

        window.WAPI._unloadInform = event => {
            // Save in the buffer the ungot unreaded messages
            window.WAPI._newMessagesBuffer.forEach(message => {
                Object.keys(message).forEach(key => (message[key] === undefined ? delete message[key] : ""));
            });
            sessionStorage.setItem("saved_msgs", JSON.stringify(window.WAPI._newMessagesBuffer));

            // Inform callbacks that the page will be reloaded.
            window.WAPI._newMessagesCallbacks.forEach(function (callbackObj) {
                if (callbackObj.callback !== undefined) {
                    callbackObj.callback({ status: -1, message: "page will be reloaded, wait and register callback again." });
                }
            });
        };

        window.addEventListener("unload", window.WAPI._unloadInform, false);
        window.addEventListener("beforeunload", window.WAPI._unloadInform, false);
        window.addEventListener("pageunload", window.WAPI._unloadInform, false);
        console.log("Application Ready");
        //console.log(window.WappBot.configWappBot.messageOption(true, "", "hi"));
    }, 10000);

});
