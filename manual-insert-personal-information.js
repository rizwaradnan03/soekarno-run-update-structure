import { v4 as uuidv4 } from "uuid";

let queries = []

const personalInformations = [
    // {
    //     firstName: "Muhammad",
    //     lastName: "Kadafy",
    //     birthDate: "1996-06-19",
    //     ktp: "1673011906660002",
    //     contact: "081368978282",
    //     emergencyContact: "081995810510",
    //     nameOfEmergencyContact: "Nadia Diva",
    //     relationOfEmergencyContact: "pasangan",
    //     shirtSize: "M",
    //     gender: "PRIA",
    //     shirtType: "PRIA",
    //     bloodType: "A+",
    //     bibName: "-"
    // }
    {
        userId: "18295870-7143-4502-a931-420043a880a2",
        firstName: "Ganya",
        lastName: "Salsabila",
        gender: "WANITA",
        birthDate: "2003-11-26",
        ktp: "7371136611030003",
        contact: "087778934522",
        emergencyContact: "085161551885",
        nameOfEmergencyContact: "Sakti",
        relationOfEmergencyContact: "saudara",
        shirtSize: "S",
        shirtType: "WANITA",
        bloodType: "A+",
        bibName: "-"
    },
    {
        userId: "a23e615c-81a8-4caa-986e-0e79e9ee4a91",
        firstName: "Gessy",
        lastName: "Shellomita",
        gender: "WANITA",
        birthDate: "1982-07-05",
        ktp: "3273134507850007",
        contact: "081524567888",
        emergencyContact: "085161551885",
        nameOfEmergencyContact: "Sakti",
        relationOfEmergencyContact: "saudara",
        shirtSize: "S",
        shirtType: "WANITA",
        bloodType: "A+",
        bibName: "-"
    },
    {
        userId: "3a3a1b73-dc38-4f50-a3b1-86c695052d9a",
        firstName: "Fanda",
        lastName: "Rahayuwati",
        gender: "WANITA",
        // birthDate: "1982-07-05",
        ktp: "3273225602820004",
        contact: "085220668868",
        emergencyContact: "08112252818",
        nameOfEmergencyContact: "Restiani",
        relationOfEmergencyContact: "saudara",
        shirtSize: "S",
        shirtType: "WANITA",
        bloodType: "B+",
        bibName: "-"
    }
]

for (let i = 0; i < personalInformations.length; i++) {
    const personalInfo = personalInformations[i]

    queries.push(`INSERT INTO personal_infomations (id, user_id, first_name, last_name, contact, gender, nationality, ktp, health_problem, name_of_emergency_contact, relation_of_emergency_contact, "emergencyContact", shirt_type, created_at, updated_at, shirt_size, blood_type, estimation_hour, estimation_minute, bib_name) VALUES ('${uuidv4()}', 'c53e1c3f-c55b-47fb-a6e5-53baef61d575', '${personalInfo.firstName}', '${personalInfo.lastName}', '${personalInfo.contact}', '${personalInfo.gender}', 'WNI', '${personalInfo.ktp}', '-', '${personalInfo.nameOfEmergencyContact}', '${personalInfo.relationOfEmergencyContact}', '${personalInfo.emergencyContact}', '${personalInfo.shirtType}', '2025-05-21', '2025-05-21', '${personalInfo.shirtSize}', '${personalInfo.bloodType}', 1, 1, '${personalInfo.bibName}');`)
}

console.log("Data Queries : ", queries)