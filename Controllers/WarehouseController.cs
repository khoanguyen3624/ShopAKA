using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using ShopAKA.Models;

namespace ShopAKA.Controllers
{
    public class WarehouseController : Controller
    {
        private MyShopEntities db = new MyShopEntities();

        public ActionResult StockAvailable()
        {
            var allProducts = db.Product.Include(p => p.Category).Include(p => p.OrderDetail).ToList();

            var productsInStock = allProducts.Where(p => p.StockQuantity > 0).ToList();
            var productsOutOfStock = allProducts.Where(p => p.StockQuantity == 0).ToList();

            ViewBag.ProductsInStock = productsInStock;
            ViewBag.ProductsOutOfStock = productsOutOfStock;

            return View();
        }

        [HttpPost]
        public JsonResult UpdateStockQuantity(int productId, int stockQuantity)
        {
            try
            {
                var product = db.Product.Find(productId);
                if (product == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy sản phẩm" });
                }

                if (stockQuantity < 0)
                {
                    return Json(new { success = false, message = "Số lượng tồn không được âm" });
                }

                product.StockQuantity = stockQuantity;
                db.SaveChanges();

                return Json(new { success = true, message = "Cập nhật số lượng tồn thành công", stockQuantity = stockQuantity });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
            }
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

