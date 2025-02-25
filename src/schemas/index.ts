import * as Yup from "yup";

export const userValidationSchema = Yup.object({
    password: Yup.string()
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .matches(/\d/, "Mật khẩu phải chứa ít nhất một số")
        .matches(/[a-zA-Z]/, "Mật khẩu phải chứa ít nhất một chữ cái")
        .required("Mật khẩu là bắt buộc"),
    email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
    fullName: Yup.string().required("Tên là bắt buộc"),
    phoneNumber: Yup.string()
        .matches(/^\d{10}$/, "Số điện thoại phải có 10 ký tự")
        .required("Số điện thoại là bắt buộc"),
    dateOfBirth: Yup.date().required("Ngày sinh là bắt buộc").nullable(),
});

export const loginValidationSchema = Yup.object().shape({
    email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
    password: Yup.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .matches(/\d/, "Mật khẩu phải chứa ít nhất một số")
    .matches(/[a-zA-Z]/, "Mật khẩu phải chứa ít nhất một chữ cái")
    .required("Mật khẩu là bắt buộc"),
  });

export const forgotPasswordValidationSchema = Yup.object().shape({
    forgotPasswordEmail: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  });

export const EditVoucherValidationSchema = Yup.object({
      description: Yup.string().required("Vui lòng nhập mô tả"),
      discountPercentage: Yup.number()
          .required("Vui lòng nhập phần trăm giảm giá")
          .min(0, "Phần trăm giảm giá không được âm")
          .max(100, "Phần trăm giảm giá không được vượt quá 100"),
      discountCode: Yup.string().required("Vui lòng nhập mã giảm giá"),
      startDate: Yup.date().required("Vui lòng chọn ngày bắt đầu"),
      endDate: Yup.date()
          .required("Vui lòng chọn ngày kết thúc")
          .min(Yup.ref("startDate"), "Ngày kết thúc phải sau ngày bắt đầu"),
  });


