export interface FixedLengthArray<L extends number, T> extends ArrayLike<T> {
    length: L
}

export interface Date {
    day: number,
    month: number,
    year: number,
}

export interface DocumentInfo {
    surname: string,
    name: string,
    patronymic: string,
    birthdate: Date,
    docdate: Date,
    doctype?: "21" | string,
    docnumber: {
        serial: FixedLengthArray<4, number>,
        identifier: FixedLengthArray<6, number>,
    }
}

const encode = (data: Record<string, string>) => {
    const encoded = Object.keys(data)
        .map(
            key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key] as string)
        )
        .join("&");
    return encoded;
};

const zeroPad = (number: number, length = 2) => String(number).padStart(length, '0')

function suggestInn(
    { surname, name, patronymic, birthdate, doctype = "21", docnumber, docdate }: DocumentInfo
) {
    return new Promise((resolve, reject) => {
        fetch("https://service.nalog.ru/inn-proc.do", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: encode({
                fam: surname,
                nam: name,
                otch: patronymic,
                bdate: `${zeroPad(birthdate.day, 2)}.${zeroPad(birthdate.month, 2)}.${birthdate.year}`,
                doctype: doctype,
                docno: `${docnumber.serial[0]}${docnumber.serial[1]} ${docnumber.serial[2]}${docnumber.serial[3]} ${docnumber.identifier[0]}${docnumber.identifier[1]}${docnumber.identifier[2]}${docnumber.identifier[3]}${docnumber.identifier[4]}${docnumber.identifier[5]}`,
                docdt: `${zeroPad(docdate.day, 2)}.${zeroPad(docdate.month, 2)}.${docdate.year}`,
                c: "innMy",
            })
        }).then(async (response) => {
            resolve(await response.json())
        }).catch(reject)
    })
}

export { suggestInn };