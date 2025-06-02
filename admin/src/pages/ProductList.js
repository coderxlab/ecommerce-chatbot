import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col, Form } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { getProducts, deleteProduct } from '../services/api';
import Loader from '../components/Loader';
import Message from '../components/Message';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts(keyword, page);
        setProducts(data.products);
        setPages(data.pages);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, page]);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await deleteProduct(id);
        toast.success('Product deleted');
        // Refresh product list
        const data = await getProducts(keyword, page);
        setProducts(data.products);
        setPages(data.pages);
      } catch (err) {
        toast.error(err.message || 'Failed to delete product');
      } finally {
        setLoading(false);
      }
    }
  };

  const searchHandler = (e) => {
    e.preventDefault();
    setPage(1);
    // The effect will trigger the API call
  };

  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className="text-end">
          <Button className="btn-sm" onClick={() => navigate('/products/new')}>
            <FaPlus /> Add Product
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form onSubmit={searchHandler}>
            <Form.Group className="d-flex">
              <Form.Control
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <Button type="submit" variant="outline-primary" className="ms-2">
                Search
              </Button>
            </Form.Group>
          </Form>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>IMAGE</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th>STOCK</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id.substring(0, 8)}...</td>
                  <td>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>{product.countInStock}</td>
                  <td className="action-buttons">
                    <LinkContainer to={`/products/${product._id}/edit`}>
                      <Button variant="light" className="btn-sm">
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => deleteHandler(product._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          {pages > 1 && (
            <div className="d-flex justify-content-center mt-3">
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
    </>
  );
};

export default ProductList;
