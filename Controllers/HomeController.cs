using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ShopAKA.Models;
using System.Data.Entity;

namespace ShopAKA.Controllers
{
    public class HomeController : BaseController
    {
        
        public ActionResult Index(int page = 1)
        {
            int categoriesPerPage = 2;
            int skip = (page - 1) * categoriesPerPage;

            var categories = db.Category
                .OrderBy(c => c.CategoryID)
                .Skip(skip)
                .Take(categoriesPerPage)
                .ToList();

            var categoriesWithProducts = categories.Select(c => new CategoryWithProductsViewModel
            {
                Category = c,
                Products = db.Product
                    .Where(p => p.CategoryID == c.CategoryID && p.StockQuantity > 0)
                    .OrderBy(p => p.ProductID)
                    .ToList()
            }).ToList();

            int totalCategories = db.Category.Count();
            int totalPages = (int)Math.Ceiling((double)totalCategories / categoriesPerPage);

            ViewBag.CurrentPage = page;
            ViewBag.TotalPages = totalPages;
            ViewBag.CategoriesWithProducts = categoriesWithProducts;

            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Login()
        {
            return View();
        }

        public ActionResult Cart()
        {
            return View();
        }

        public ActionResult Checkout()
        {
            if (Session["CustomerID"] != null)
            {
                int customerId = (int)Session["CustomerID"];
                var customer = db.Customer.Find(customerId);
                if (customer != null)
                {
                    ViewBag.Customer = customer;
                }
            }
            return View();
        }

        [HttpPost]
        public ActionResult ProcessCheckout(FormCollection form)
        {
            try
            {
                string customerName = form["customerName"];
                string customerPhone = form["customerPhone"];
                string customerEmail = form["customerEmail"];
                string customerAddress = form["customerAddress"];
                string paymentMethod = form["paymentMethod"];
                string note = form["note"];
                string orderItemsJson = form["orderItems"];

                if (string.IsNullOrEmpty(orderItemsJson))
                {
                    TempData["CheckoutError"] = "Giỏ hàng trống!";
                    return RedirectToAction("Cart", "Home");
                }

                var orderItems = Newtonsoft.Json.JsonConvert.DeserializeObject<List<dynamic>>(orderItemsJson);
                
                if (orderItems == null || orderItems.Count == 0)
                {
                    TempData["CheckoutError"] = "Giỏ hàng trống!";
                    return RedirectToAction("Cart", "Home");
                }

                decimal totalAmount = 0;
                var orderDetails = new List<OrderDetail>();

                foreach (var item in orderItems)
                {
                    int productId = (int)item.id;
                    int quantity = (int)item.quantity;
                    decimal price = (decimal)item.price;

                    var product = db.Product.Find(productId);
                    if (product == null)
                    {
                        TempData["CheckoutError"] = $"Sản phẩm với ID {productId} không tồn tại!";
                        return RedirectToAction("Cart", "Home");
                    }

                    if (product.StockQuantity < quantity)
                    {
                        TempData["CheckoutError"] = $"Sản phẩm {product.ProductName} không đủ số lượng tồn kho!";
                        return RedirectToAction("Cart", "Home");
                    }

                    decimal itemTotal = price * quantity;
                    totalAmount += itemTotal;

                    var orderDetail = new OrderDetail
                    {
                        ProductID = productId,
                        Quantity = quantity,
                        UnitPrice = price
                    };
                    orderDetails.Add(orderDetail);

                    product.StockQuantity -= quantity;
                }

                int customerId = 0;
                if (Session["CustomerID"] != null)
                {
                    customerId = (int)Session["CustomerID"];
                }
                else
                {
                    var existingCustomer = db.Customer.FirstOrDefault(c => c.CustomerPhone == customerPhone);
                    if (existingCustomer != null)
                    {
                        customerId = existingCustomer.CustomerID;
                    }
                    else
                    {
                        var newCustomer = new Customer
                        {
                            CustomerName = customerName,
                            CustomerPhone = customerPhone,
                            CustomerEmail = string.IsNullOrEmpty(customerEmail) ? null : customerEmail,
                            CustomerAddress = customerAddress
                        };
                        db.Customer.Add(newCustomer);
                        db.SaveChanges();
                        customerId = newCustomer.CustomerID;
                    }
                }

                var order = new Order
                {
                    CustomerID = customerId,
                    OrderDate = DateTime.Now,
                    TotalAmount = totalAmount,
                    PaymentStatus = paymentMethod == "cod" ? "Chưa thanh toán" : "Đã thanh toán",
                    AddressDelivery = customerAddress
                };

                db.Order.Add(order);
                db.SaveChanges();

                foreach (var detail in orderDetails)
                {
                    detail.OrderID = order.OrderID;
                    db.OrderDetail.Add(detail);
                }

                db.SaveChanges();

                TempData["OrderSuccess"] = true;
                TempData["OrderID"] = order.OrderID;
                TempData["TotalAmount"] = totalAmount;
                TempData["ClearCart"] = true;
                TempData["PaymentMethod"] = paymentMethod == "cod" ? "Thanh toán khi nhận hàng (COD)" : "Thẻ tín dụng/ghi nợ";

                return RedirectToAction("CheckoutSuccess", new { orderId = order.OrderID });
            }
            catch (Exception ex)
            {
                TempData["CheckoutError"] = "Có lỗi xảy ra khi xử lý đơn hàng: " + ex.Message;
                return RedirectToAction("Cart", "Home");
            }
        }

        public ActionResult CheckoutSuccess(int orderId)
        {
            var order = db.Order
                .Include("OrderDetail")
                .Include("OrderDetail.Product")
                .Include("OrderDetail.Product.Category")
                .FirstOrDefault(o => o.OrderID == orderId);

            if (order == null)
            {
                return HttpNotFound();
            }

            return View(order);
        }

        public ActionResult Profile()
        {
            if (Session["CustomerID"] == null)
            {
                return RedirectToAction("Login", "Home");
            }

            int customerId = (int)Session["CustomerID"];
            var customer = db.Customer.Include("User").FirstOrDefault(c => c.CustomerID == customerId);
            
            if (customer == null)
            {
                return HttpNotFound();
            }

            return View(customer);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult UpdateProfile(FormCollection form)
        {
            if (Session["CustomerID"] == null)
            {
                return RedirectToAction("Login", "Home");
            }

            try
            {
                int customerId = (int)Session["CustomerID"];
                var customer = db.Customer.Find(customerId);

                if (customer == null)
                {
                    return HttpNotFound();
                }

                customer.CustomerName = form["CustomerName"];
                customer.CustomerPhone = form["CustomerPhone"];
                customer.CustomerEmail = form["CustomerEmail"];
                customer.CustomerAddress = form["CustomerAddress"];

                db.SaveChanges();

                Session["CustomerName"] = customer.CustomerName;

                TempData["SuccessMessage"] = "Cập nhật thông tin thành công!";
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = "Có lỗi xảy ra: " + ex.Message;
            }

            return RedirectToAction("Profile");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ChangePassword(FormCollection form)
        {
            if (Session["CustomerID"] == null)
            {
                return RedirectToAction("Login", "Home");
            }

            try
            {
                int customerId = (int)Session["CustomerID"];
                var customer = db.Customer.Include("User").FirstOrDefault(c => c.CustomerID == customerId);

                if (customer == null || customer.User == null)
                {
                    TempData["ErrorMessage"] = "Không tìm thấy thông tin tài khoản!";
                    return RedirectToAction("Profile");
                }

                string oldPassword = form["OldPassword"]?.Trim();
                string newPassword = form["NewPassword"]?.Trim();
                string confirmPassword = form["ConfirmPassword"]?.Trim();
                string currentPassword = customer.User.Password?.Trim();

                if (string.IsNullOrEmpty(oldPassword) || string.IsNullOrEmpty(newPassword) || string.IsNullOrEmpty(confirmPassword))
                {
                    TempData["ErrorMessage"] = "Vui lòng điền đầy đủ thông tin!";
                    return RedirectToAction("Profile");
                }

                if (!string.Equals(currentPassword, oldPassword, StringComparison.Ordinal))
                {
                    TempData["ErrorMessage"] = "Mật khẩu hiện tại không đúng!";
                    return RedirectToAction("Profile");
                }

                if (newPassword != confirmPassword)
                {
                    TempData["ErrorMessage"] = "Mật khẩu mới không khớp!";
                    return RedirectToAction("Profile");
                }

                if (newPassword.Length < 6)
                {
                    TempData["ErrorMessage"] = "Mật khẩu phải có ít nhất 6 ký tự!";
                    return RedirectToAction("Profile");
                }

                customer.User.Password = newPassword;
                db.SaveChanges();

                TempData["SuccessMessage"] = "Đổi mật khẩu thành công!";
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = "Có lỗi xảy ra: " + ex.Message;
            }

            return RedirectToAction("Profile");
        }

        public ActionResult OrderHistory()
        {
            if (Session["CustomerID"] == null)
            {
                return RedirectToAction("Login", "Home");
            }

            int customerId = (int)Session["CustomerID"];
            var orders = db.Order
                .Where(o => o.CustomerID == customerId)
                .OrderByDescending(o => o.OrderDate)
                .ToList();

            return View(orders);
        }

        public ActionResult OrderDetail(int? id)
        {
            if (Session["CustomerID"] == null)
            {
                return RedirectToAction("Login", "Home");
            }

            if (id == null)
            {
                return RedirectToAction("OrderHistory", "Home");
            }

            int customerId = (int)Session["CustomerID"];
            var order = db.Order
                .Include(o => o.Customer)
                .Include(o => o.OrderDetail)
                .FirstOrDefault(o => o.OrderID == id && o.CustomerID == customerId);

            if (order == null)
            {
                return HttpNotFound();
            }

            if (order.OrderDetail != null)
            {
                foreach (var detail in order.OrderDetail)
                {
                    if (detail.ProductID > 0)
                    {
                        detail.Product = db.Product
                            .Include(p => p.Category)
                            .FirstOrDefault(p => p.ProductID == detail.ProductID);
                    }
                }
            }

            return View(order);
        }

        public ActionResult ProductDetail(int id = 0)
        {
            if (id == 0)
            {
                ViewBag.Error = "Thiếu mã sản phẩm (id)";
                return View();
            }

            var product = db.Product
                .Include("Category")
                .FirstOrDefault(p => p.ProductID == id && p.StockQuantity > 0);

            if (product == null)
            {
                ViewBag.Error = "Không tìm thấy sản phẩm hoặc sản phẩm đã hết hàng";
                return View();
            }

            return View(product);
        }

        public ActionResult Search(string query, int page = 1)
        {
            int productsPerPage = 12;
            int skip = (page - 1) * productsPerPage;

            if (string.IsNullOrWhiteSpace(query))
            {
                ViewBag.SearchQuery = "";
                ViewBag.Products = new List<Product>();
                ViewBag.CurrentPage = 1;
                ViewBag.TotalPages = 0;
                ViewBag.TotalResults = 0;
                return View();
            }

            var allProducts = db.Product
                .Include("Category")
                .Where(p => p.StockQuantity > 0 && 
                           (p.ProductName.Contains(query) || 
                            (p.ProductDecription != null && p.ProductDecription.Contains(query))))
                .OrderBy(p => p.ProductID);

            int totalResults = allProducts.Count();
            int totalPages = (int)Math.Ceiling((double)totalResults / productsPerPage);

            var products = allProducts
                .Skip(skip)
                .Take(productsPerPage)
                .ToList();

            ViewBag.SearchQuery = query;
            ViewBag.Products = products;
            ViewBag.CurrentPage = page;
            ViewBag.TotalPages = totalPages;
            ViewBag.TotalResults = totalResults;

            return View();
        }

        public ActionResult CategoryProducts(int? id, int page = 1)
        {
            if (id == null)
            {
                return RedirectToAction("Index");
            }

            var category = db.Category
                .Where(c => c.CategoryID == id)
                .Select(c => new { c.CategoryID, c.CategoryName })
                .FirstOrDefault();
                
            if (category == null)
            {
                return HttpNotFound();
            }

            int productsPerPage = 12;
            int skip = (page - 1) * productsPerPage;

            var allProducts = db.Product
                .Where(p => p.CategoryID == id && p.StockQuantity > 0)
                .OrderBy(p => p.ProductID);

            int totalProducts = allProducts.Count();
            int totalPages = (int)Math.Ceiling((double)totalProducts / productsPerPage);

            var products = allProducts
                .Skip(skip)
                .Take(productsPerPage)
                .ToList();

            ViewBag.CategoryID = category.CategoryID;
            ViewBag.CategoryName = category.CategoryName;
            ViewBag.Products = products;
            ViewBag.CurrentPage = page;
            ViewBag.TotalPages = totalPages;
            ViewBag.TotalProducts = totalProducts;
            ViewBag.categoryName = category.CategoryName;
            return View();
        }
    }
}