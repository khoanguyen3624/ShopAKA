using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using ShopAKA.Models;
using System.IO;

namespace ShopAKA.Controllers
{
    public class ProductsController : Controller
    {
        private MyShopEntities db = new MyShopEntities();

        public ActionResult Index()
        {
            var products = db.Product.Include(p => p.Category).Include(p => p.OrderDetail).ToList();
            return View(products);
        }

        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Product product = db.Product.Include(p => p.Category).FirstOrDefault(p => p.ProductID == id);
            if (product == null)
            {
                return HttpNotFound();
            }
            return View(product);
        }

        // GET: Products/Create
        public ActionResult Create()
        {
            ViewBag.CategoryID = new SelectList(db.Category, "CategoryID", "CategoryName");
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "ProductID,CategoryID,ProductName,ProductDecription,ProductPrice,ProductImage")] Product product, HttpPostedFileBase imageFile)
        {
            if (ModelState.IsValid)
            {
                if (imageFile != null && imageFile.ContentLength > 0)
                {
                    var fileName = Path.GetFileName(imageFile.FileName);
                    var uniqueFileName = Guid.NewGuid().ToString() + "_" + fileName;
                    var uploadFolder = Server.MapPath("~/images/anhsanpham");
                    var uploadPath = Path.Combine(uploadFolder, uniqueFileName);

                    if (!Directory.Exists(uploadFolder))
                    {
                        Directory.CreateDirectory(uploadFolder);
                    }

                    imageFile.SaveAs(uploadPath);
                    product.ProductImage = "/images/anhsanpham/" + uniqueFileName;
                }

                db.Product.Add(product);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.CategoryID = new SelectList(db.Category, "CategoryID", "CategoryName", product.CategoryID);
            return View(product);
        }

        // GET: Products/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Product product = db.Product.Find(id);
            if (product == null)
            {
                return HttpNotFound();
            }
            ViewBag.CategoryID = new SelectList(db.Category, "CategoryID", "CategoryName", product.CategoryID);
            return View(product);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "ProductID,CategoryID,ProductName,ProductDecription,ProductPrice,ProductImage")] Product product, HttpPostedFileBase imageFile)
        {
            if (ModelState.IsValid)
            {
                var existingProduct = db.Product.Find(product.ProductID);
                if (existingProduct == null)
                {
                    return HttpNotFound();
                }

                if (imageFile != null && imageFile.ContentLength > 0)
                {
                    var fileName = Path.GetFileName(imageFile.FileName);
                    var uniqueFileName = Guid.NewGuid().ToString() + "_" + fileName;
                    var uploadFolder = Server.MapPath("~/images/anhsanpham");
                    var uploadPath = Path.Combine(uploadFolder, uniqueFileName);

                    if (!Directory.Exists(uploadFolder))
                    {
                        Directory.CreateDirectory(uploadFolder);
                    }

                    if (!string.IsNullOrEmpty(existingProduct.ProductImage))
                    {
                        var oldImagePath = Server.MapPath("~" + existingProduct.ProductImage);
                        if (System.IO.File.Exists(oldImagePath))
                        {
                            System.IO.File.Delete(oldImagePath);
                        }
                    }

                    imageFile.SaveAs(uploadPath);
                    product.ProductImage = "/images/anhsanpham/" + uniqueFileName;
                }
                else
                {
                    product.ProductImage = existingProduct.ProductImage;
                }

                existingProduct.CategoryID = product.CategoryID;
                existingProduct.ProductName = product.ProductName;
                existingProduct.ProductDecription = product.ProductDecription;
                existingProduct.ProductPrice = product.ProductPrice;
                existingProduct.ProductImage = product.ProductImage;

                db.Entry(existingProduct).State = System.Data.Entity.EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.CategoryID = new SelectList(db.Category, "CategoryID", "CategoryName", product.CategoryID);
            return View(product);
        }

        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Product product = db.Product.Find(id);
            if (product == null)
            {
                return HttpNotFound();
            }

            db.Entry(product).Collection(p => p.OrderDetail).Load();
            ViewBag.HasRelatedOrders = product.OrderDetail != null && product.OrderDetail.Count > 0;
            ViewBag.OrderDetailCount = product.OrderDetail != null ? product.OrderDetail.Count : 0;
            return View(product);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            Product product = db.Product.Find(id);
            if (product == null)
            {
                return HttpNotFound();
            }

            db.Entry(product).Collection(p => p.OrderDetail).Load();
            var orderDetailList = product.OrderDetail.ToList();

            if (orderDetailList == null || orderDetailList.Count == 0)
            {
                if (!string.IsNullOrEmpty(product.ProductImage))
                {
                    var imagePath = Server.MapPath("~" + product.ProductImage);
                    if (System.IO.File.Exists(imagePath))
                    {
                        System.IO.File.Delete(imagePath);
                    }
                }

                db.Product.Remove(product);
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            else
            {
                return Content("<script>alert('Không thể xóa sản phẩm này vì đang có " + orderDetailList.Count + " đơn hàng liên quan. Vui lòng xóa các đơn hàng trước.'); window.location.href = '/Products';</script>", "text/html");
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
