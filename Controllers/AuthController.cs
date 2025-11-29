using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ShopAKA.Models;

namespace ShopAKA.Controllers
{
    public class AuthController : Controller
    {
        private MyShopEntities db = new MyShopEntities();

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
            {
                TempData["RegisterError"] = "Vui lòng kiểm tra lại thông tin đã nhập";
                TempData["RegisterModel"] = model;
                return RedirectToAction("Login", "Home");
            }

            if (db.User.Any(u => u.Username == model.Username))
            {
                TempData["RegisterError"] = "Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác";
                TempData["RegisterModel"] = model;
                return RedirectToAction("Login", "Home");
            }

            if (db.Customer.Any(c => c.CustomerEmail == model.CustomerEmail))
            {
                TempData["RegisterError"] = "Email đã được sử dụng. Vui lòng sử dụng email khác";
                TempData["RegisterModel"] = model;
                return RedirectToAction("Login", "Home");
            }

            if (db.Customer.Any(c => c.CustomerPhone == model.CustomerPhone))
            {
                TempData["RegisterError"] = "Số điện thoại đã được sử dụng. Vui lòng sử dụng số điện thoại khác";
                TempData["RegisterModel"] = model;
                return RedirectToAction("Login", "Home");
            }

            try
            {
                var newUser = new User
                {
                    Username = model.Username,
                    Password = model.Password,
                    UserRole = "2" 
                };

                db.User.Add(newUser);
                db.SaveChanges();

                var newCustomer = new Customer
                {
                    CustomerName = model.CustomerName,
                    CustomerPhone = model.CustomerPhone,
                    CustomerEmail = model.CustomerEmail,
                    CustomerAddress = model.CustomerAddress ?? "",
                    Username = model.Username
                };

                db.Customer.Add(newCustomer);
                db.SaveChanges();

                TempData["RegisterSuccess"] = "Đăng ký thành công! Vui lòng đăng nhập";
                return RedirectToAction("Login", "Home");
            }
            catch (Exception ex)
            {
                TempData["RegisterError"] = "Đăng ký thất bại. Vui lòng thử lại sau. Lỗi: " + ex.Message;
                TempData["RegisterModel"] = model;
                return RedirectToAction("Login", "Home");
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Login(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                TempData["LoginError"] = "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu";
                return RedirectToAction("Login", "Home");
            }

            var user = db.User.FirstOrDefault(u => u.Username == username && u.Password == password);

            if (user != null)
            {
                if (user.UserRole == "1")
                {
                    Session["AdminUsername"] = user.Username;
                    Session["AdminRole"] = user.UserRole;
                    return RedirectToAction("Index", "Categories");
                }
                else
                {
                    Session["Username"] = user.Username;
                    Session["UserRole"] = user.UserRole;
                    var customer = db.Customer.FirstOrDefault(c => c.Username == user.Username);
                    if (customer != null)
                    {
                        Session["CustomerID"] = customer.CustomerID;
                        Session["CustomerName"] = customer.CustomerName;
                    }
                    return RedirectToAction("Index", "Home");
                }
            }
            else
            {
                TempData["LoginError"] = "Tên đăng nhập hoặc mật khẩu không đúng";
                return RedirectToAction("Login", "Home");
            }
        }

        public ActionResult Logout()
        {
            Session["Username"] = null;
            Session["UserRole"] = null;
            Session["CustomerID"] = null;
            Session["CustomerName"] = null;
            Session["AdminUsername"] = null;
            Session["AdminRole"] = null;
            Session.Abandon();
            return RedirectToAction("Index", "Home");
        }

        public ActionResult LogoutAdmin()
        {
            Session["AdminUsername"] = null;
            Session["AdminRole"] = null;
            Session.Abandon();
            return RedirectToAction("Index", "Home");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}

