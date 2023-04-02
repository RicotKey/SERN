import doctor_infor from '../models/doctor_infor';
import db from '../models/index'
require('dotenv').config();
import _, { reject } from 'lodash';

const MAX_NUMBER_SCHUEDULE = process.env.MAX_NUMBER_SCHUEDULE;
let getTopDoctorSV = (limitimput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitimput,
                where: { roleid: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password']
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] }
                ],
                raw: true,
                nest: true
            })

            resolve({
                errCode: 0,
                data: users
            })
        } catch (error) {
            reject(error)
        }
    })
}

let getAllDoctorSV = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleid: 'R2' },
                attributes: {
                    exclude: ['password', 'image']
                },
                order: [['createdAt', 'DESC']],
            })
            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (error) {
            reject(error)
        }
    })
}

let checkRequiredFields = (inputData) => {
    let arrFields = [
        'doctorid', 'contentHTML', 'contentMarkdown', 'action',
        'selectedPrice', 'selectedPayment', 'selectedProvince', 'nameClinic',
        'addressClinic', 'note', 'specialtyid'
    ]

    let isValid = true;
    let element = ''
    for (let i = 0; i < arrFields.length; i++) {
        if (!inputData[arrFields[i]]) {
            isValid = false;
            element = arrFields[i]
            break;
        }
    }

    return {
        isValid: isValid,
        element: element
    }
}

let saveDetailDoctor = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkInput = checkRequiredFields(inputData);
            if (checkInput.isValid == false) {
                resolve({
                    errCode: 1,
                    errMessage: `Parameter missing: ${checkInput.element}`
                })
            } else {
                if (inputData.action === 'CREATE') {
                    await db.Markdown.create(
                        {
                            contentHTML: inputData.contentHTML,
                            contentMarkdown: inputData.contentMarkdown,
                            description: inputData.description,
                            doctorid: inputData.doctorid

                        })

                    resolve({
                        errCode: 0,
                        errMessage: 'Create infor doctor success'
                    })
                } else if (inputData.action === 'EDIT') {
                    let markdown = await db.Markdown.findOne({
                        where: { doctorid: inputData.doctorid },
                        raw: false
                    })
                    if (markdown) {
                        markdown.contentHTML = inputData.contentHTML;
                        markdown.contentMarkdown = inputData.contentMarkdown;
                        markdown.description = inputData.description;
                        await markdown.save()
                        resolve({
                            errCode: 0,
                            errMessage: 'Save infor doctor success'
                        })
                    }

                }

                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: {
                        doctorid: inputData.doctorid,
                    },
                    raw: false
                })
                if (doctorInfor) {

                    doctorInfor.doctorid = inputData.doctorid;
                    doctorInfor.priceid = inputData.selectedPrice;
                    doctorInfor.provinceid = inputData.selectedProvince;
                    doctorInfor.paymentid = inputData.selectedPayment;
                    doctorInfor.nameClinic = inputData.nameClinic;
                    doctorInfor.addressClinic = inputData.addressClinic;
                    doctorInfor.note = inputData.note;
                    doctorInfor.specialtyid = inputData.specialtyid;
                    doctorInfor.clinicid = inputData.clinicid;
                    await doctorInfor.save()
                } else {
                    await db.Doctor_Infor.create({
                        doctorid: inputData.doctorid,
                        priceid: inputData.selectedPrice,
                        provinceid: inputData.selectedProvince,
                        paymentid: inputData.selectedPayment,
                        nameClinic: inputData.nameClinic,
                        addressClinic: inputData.nameClinic,
                        addressClinic: inputData.addressClinic,
                        specialtyid: inputData.specialtyid,
                        clinicid: inputData.clinicid,
                        note: inputData.note
                    })
                }
                resolve({
                    errCode: 0,
                    errMessage: 'Save infor doctor succed!'
                })

            }
        } catch (error) {
            reject(error)
        }

    })
}

let getdetailDoctorSV = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Parameter missing'
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: id
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown'],

                        },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorid']
                            },
                            include: [

                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] }
                            ]
                        }

                    ],
                    raw: true,
                    nest: true
                })
                if (!data) data = {};
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (error) {
            reject(error)
        }

    })
}

let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorid || !data.formatedDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required param !'
                })
            } else {
                let schedule = data.arrSchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHUEDULE;
                        return item;
                    })
                }
                let existing = await db.Schedule.findAll(
                    {
                        where: { doctorid: data.doctorid, date: data.formatedDate },
                        attributes: ['timeType', 'date', 'doctorid', 'maxNumber'],
                        raw: true
                    }
                );

                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date
                });

                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }
                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }


        } catch (error) {
            reject(error)
        }
    })
}

let getScheduleByDate = (doctorid, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorid || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorid: doctorid,
                        date: date
                    },
                    include: [
                        { model: db.Allcode, as: 'timeTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.User, as: 'doctorData', attributes: ['firstname', 'lastname'] }

                    ],
                    raw: false,
                    nest: true
                })
                if (!dataSchedule) dataSchedule = [];

                resolve({
                    errCode: 0,
                    data: dataSchedule
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

let getExtraInforDoctorById = (idInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!idInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let data = await db.Doctor_Infor.findOne({
                    where: {
                        doctorid: idInput,

                    },
                    attributes: {
                        exclude: ['id', 'doctorid']
                    },
                    include: [
                        { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                    ],
                    raw: false,
                    nest: true
                })
                if (!data) data = [];

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

let getProfileDoctorById = (idInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!idInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: idInput,

                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [{
                        model: db.Markdown,
                        attributes: ['description', 'contentHTML', 'contentMarkdown']
                    },

                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    {
                        model: db.Doctor_Infor,
                        attributes: {
                            exclude: ['id', 'doctorid']
                        },
                        include: [

                            { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },

                        ]
                    }

                    ],
                    raw: false,
                    nest: true
                })
                if (!data) data = [];

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}



module.exports = {
    getTopDoctorSV,
    getAllDoctorSV,
    saveDetailDoctor,
    getdetailDoctorSV,
    bulkCreateSchedule,
    getScheduleByDate,
    getExtraInforDoctorById,
    getProfileDoctorById
}