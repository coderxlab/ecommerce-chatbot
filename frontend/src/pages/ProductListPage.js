import React, { useState, useEffect } from 'react';
import { Row, Col, Container, Form, Button, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { getProducts } from '../services/api';

const ProductListPage = () => {
  const { keyword, pageNumber = 1 } = useParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(Number(pageNumber));
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
  });
  
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts(keyword, page);
        setProducts(data.products);
        setPages(data.pages);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.products.map(p => p.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, page]);

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    let match = true;
    
    if (filters.category && product.category !== filters.category) {
      match = false;
    }
    
    if (filters.minPrice && product.price < Number(filters.minPrice)) {
      match = false;
    }
    
    if (filters.maxPrice && product.price > Number(filters.maxPrice)) {
      match = false;
    }
    
    if (filters.rating && product.rating < Number(filters.rating)) {
      match = false;
    }
    
    return match;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
    });
  };

  return (
    <Container>
      <Meta title="Products" />
      <h1>Products</h1>
      {keyword && <p>Search results for: {keyword}</p>}
      
      <Row>
        <Col md={3}>
          <Card className="filter-section mb-4">
            <Card.Body>
              <h4>Filters</h4>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    as="select"
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Price Range</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Min"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Max"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Rating</Form.Label>
                  <Form.Control
                    as="select"
                    name="rating"
                    value={filters.rating}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Stars</option>
                  </Form.Control>
                </Form.Group>
                
                <Button variant="secondary" onClick={clearFilters} className="w-100">
                  Clear Filters
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={9}>
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <>
              <Row>
                {filteredProducts.length === 0 ? (
                  <Message>No products found</Message>
                ) : (
                  filteredProducts.map((product) => (
                    <Col key={product._id} sm={12} md={6} lg={4} className="mb-4">
                      <Product product={product} />
                    </Col>
                  ))
                )}
              </Row>
              
              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  {[...Array(pages).keys()].map((x) => (
                    <Button
                      key={x + 1}
                      className={`mx-1 ${page === x + 1 ? 'active' : ''}`}
                      onClick={() => setPage(x + 1)}
                    >
                      {x + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductListPage;
