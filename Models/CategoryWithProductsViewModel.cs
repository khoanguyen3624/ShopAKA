using System.Collections.Generic;

namespace ShopAKA.Models
{
    public class CategoryWithProductsViewModel
    {
        public Category Category { get; set; }
        public List<Product> Products { get; set; }
    }
}

