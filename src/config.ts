function checkLength(min: number, max: number): Validators {
    return new class implements Validators {
        validate(value: string): string[] {
            return ((value.length >= min) && (value.length <= max)) ? [] : [`Invalid length for '${value}'.`];
        }
    }
}

const required: Validators = new class implements Validators {
    validate(value: string): string[] {
        return (value !== "") ? [] : ["Required field is missed."];
    }
};

const dateValidator: Validators = new class implements Validators {
    validate(value: string): string[] {
        const probe: Date = new Date(value);
        return (probe !== undefined && !isNaN(probe.getTime())) ? [] : [`Invalid format for '${value}'.`];
    }
};

export interface CsvType {
    parseString(str: string): this;
}

export interface Validators {

    /** if return empty array then object valid */
    validate(value: string) : string[];

}

export interface ColumnDescriptor {
    name: string,
    type: CsvType | string,
    validators: Validators[]
}

export const csv: ColumnDescriptor[] = [
    {
        name: "ID",
        type: "ID",
        validators: [
            checkLength(1,4),
            required,
        ]
    },
    {
        name: "Name",
        type: "string",
        validators: [
            checkLength(1,18),
        ]
    },
    {
        name: "Surname",
        type: "string",
        validators: [
            checkLength(1,18),
        ]
    },
    {
        name: "Mail",
        type: "Mail",
        validators: [
            checkLength(6,18),
        ]
    },
    {
        name: "Date of registration",
        type: "date",
        validators: [
            dateValidator
        ]
    },
    {
        name: "Phone",
        type: "Phone",
        validators: [
            checkLength(14,16),
        ]
    },
];

export const database = [
    {
        name: "ID",
        type: "INT NOT NULL PRIMARY KEY",
        data: "ID"
    },
    {
        name: "Name",
        type: "VARCHAR(50)",
        data: "Name"
    },
    {
        name: "Surname",
        type: "VARCHAR(50)",
        data: "Surname"
    },
    {
        name: "Mail",
        type: "VARCHAR(50)",
        data: "Mail"
    },
    {
        name: "Date",
        type: "DATE",
        data: "Date of registration"
    },
    {
        name: "Phone",
        type: "VARCHAR(50)",
        data: "Phone"
    },
];
