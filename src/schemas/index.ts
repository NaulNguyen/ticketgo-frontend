import * as Yup from "yup";

export const userValidationSchema = Yup.object({
    password: Yup.string()
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .matches(/\d/, "Mật khẩu phải chứa ít nhất một số")
        .matches(/[a-zA-Z]/, "Mật khẩu phải chứa ít nhất một chữ cái")
        .required("Mật khẩu là bắt buộc"),
    email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
    fullName: Yup.string().required("Tên là bắt buộc"),
    phone: Yup.string()
        .matches(/^\d{10}$/, "Số điện thoại phải có 10 ký tự")
        .required("Số điện thoại là bắt buộc"),
    identityNo: Yup.string()
        .matches(/^\d{12}$/, "Số căn cước phải có 12 ký tự")
        .required("Số căn cước là bắt buộc"),
    dateOfBirth: Yup.date().required("Ngày sinh là bắt buộc").nullable(),
    address: Yup.string().required("Địa chỉ là bắt buộc"),
});

export const companyValidationSchema = Yup.object({
    password: Yup.string()
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .matches(/\d/, "Mật khẩu phải chứa ít nhất một số")
        .matches(/[a-zA-Z]/, "Mật khẩu phải chứa ít nhất một chữ cái")
        .required("Mật khẩu là bắt buộc"),
    email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
    companyName: Yup.string()
        .max(100, "Tên công ty không được vượt quá 100 ký tự")
        .required("Tên công ty là bắt buộc"),
    phone: Yup.string()
        .matches(/^\d{10}$/, "Số điện thoại phải có 10 ký tự")
        .required("Số điện thoại là bắt buộc"),
    address: Yup.string()
        .max(255, "Địa chỉ không được vượt quá 255 ký tự")
        .required("Địa chỉ là bắt buộc"),
    description: Yup.string().max(500, "Mô tả không được vượt quá 500 ký tự"),
    businessLicense: Yup.string()
        .matches(/^\d{10,13}$/, "Giấy phép kinh doanh phải có từ 10 đến 13 ký tự")
        .required("Giấy phép kinh doanh là bắt buộc"),
});
