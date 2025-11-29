using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using ShopAKA.Models;

namespace ShopAKA.Controllers
{
    public class CategoriesController : Controller
    {
        private MyShopEntities db = new MyShopEntities();

        // GET: Categories
        public ActionResult Index()
        {
            var categories = db.Category.Include(c => c.Product).ToList();
            return View(categories);
        }

        // GET: Categories/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Categories/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "CategoryID,CategoryName")] Category category)
        {
            if (ModelState.IsValid)
            {
                var existingCategory = db.Category
                    .FirstOrDefault(c => c.CategoryName.ToLower() == category.CategoryName.ToLower());
                
                if (existingCategory != null)
                {
                    ModelState.AddModelError("CategoryName", "Danh mục đã tồn tại");
                    return View(category);
                }

                db.Category.Add(category);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(category);
        }

        // GET: Categories/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Category category = db.Category.Find(id);
            if (category == null)
            {
                return HttpNotFound();
            }
            return View(category);
        }

        // POST: Categories/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "CategoryID,CategoryName")] Category category)
        {
            if (ModelState.IsValid)
            {
                var existingCategory = db.Category
                    .FirstOrDefault(c => c.CategoryID != category.CategoryID && 
                                        c.CategoryName.ToLower() == category.CategoryName.ToLower());
                
                if (existingCategory != null)
                {
                    ModelState.AddModelError("CategoryName", "Danh mục đã tồn tại");
                    return View(category);
                }

                db.Entry(category).State = System.Data.Entity.EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(category);
        }

        // GET: Categories/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Category category = db.Category.Find(id);
            if (category == null)
            {
                return HttpNotFound();
            }
            db.Entry(category).Collection(c => c.Product).Load();
            ViewBag.HasRelatedProducts = category.Product != null && category.Product.Count > 0;
            ViewBag.ProductCount = category.Product != null ? category.Product.Count : 0;
            return View(category);
        }

        // POST: Categories/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            Category category = db.Category.Find(id);
            if (category == null)
            {
                return HttpNotFound();
            }

            db.Entry(category).Collection(c => c.Product).Load();
            var productList = category.Product.ToList();

            if (productList == null || productList.Count == 0)
            {
                db.Category.Remove(category);
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            else
            {
                return Content("<script>alert('Không thể xóa danh mục này vì đang có " + productList.Count + " sản phẩm liên quan. Vui lòng xóa hoặc chuyển các sản phẩm trước.'); window.location.href = '/Categories';</script>", "text/html");
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
