import mongoose from "mongoose";

export interface IEmployee extends mongoose.Document {
  employeeCode: string;
  name: string;
  designation: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  ssfStatus: "SSF" | "NON_SSF";
  joiningDate: Date;
  bank: {
    name: string;
    accountNumber: string;
    branch: string;
  };
  status: "ACTIVE" | "INACTIVE";
}

const employeeSchema = new mongoose.Schema<IEmployee>(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT"],
      required: true,
    },

    ssfStatus: {
      type: String,
      enum: ["SSF", "NON_SSF"],
      required: true,
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    bank: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      accountNumber: {
        type: String,
        required: true,
        trim: true,
      },
      branch: {
        type: String,
        required: true,
        trim: true,
      },
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);

export default Employee;
