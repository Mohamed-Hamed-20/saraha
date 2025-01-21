import mongoose, { Schema, Document } from "mongoose";

interface Iuser extends Document {
  name: string;
  email: string;
  password: string;
  age?: number;
}

const userSchema = new Schema<Iuser>(
  {
    name: {
      type: String,
      required: true,
      minlength: [3, "name Must be at least 3, got {VALUE}"],
      maxlength: [30, "name Must be at most 30, got {VALUE}"],
    },
    email: {
      type: String,
      required: true,
      minlength: [6, "email Must be at least 6, got {VALUE}"],
      maxlength: [30, "email Must be at most 30, got {VALUE}"],
      unique: true,
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    age: {
      type: Number,
      required: false,
      min: [5, "Age must be at least 5 years old"],
      max: [100, "Age must be at most 100 years old"],
    },
  },
  { timestamps: true }
);
userSchema.index({ email: 1 });
const userModel = mongoose.model<Iuser>("user", userSchema);
export default userModel;
