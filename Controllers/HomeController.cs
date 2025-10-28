using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ShopAKA.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
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
            return View();
        }

        public ActionResult ProductDetail(int id)
        {
            try
            {
                string jsonPath = Server.MapPath("~/App_Data/products.json");
                
                if (!System.IO.File.Exists(jsonPath))
                {
                    ViewBag.Error = "File dữ liệu sản phẩm không tồn tại";
                    return View();
                }
                
                string jsonContent = System.IO.File.ReadAllText(jsonPath);
                var productData = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(jsonContent);
                
                if (productData?.products != null)
                {
                    foreach (var product in productData.products)
                    {
                        if ((int)product.id == id)
                        {
                            ViewBag.Product = product;
                            return View();
                        }
                    }
                }
                
                ViewBag.Error = "Không tìm thấy sản phẩm với ID: " + id;
                return View();
            }
            catch (Exception ex)
            {
                ViewBag.Error = "Lỗi khi tải dữ liệu sản phẩm: " + ex.Message;
                return View();
            }
        }
    }
}