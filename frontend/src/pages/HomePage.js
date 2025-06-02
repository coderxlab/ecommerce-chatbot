import React, { useState, useEffect } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';
import { getProducts } from '../services/api';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.products);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Meta />
      <div className="hero">
        <Container>
          <h1>Welcome to BuyMed Shop</h1>
          <p className="lead">Your one-stop shop for all your medical and healthcare needs</p>
        </Container>
      </div>
      <Container>
        <ProductCarousel />
        <h2>Latest Products</h2>
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                <Product product={product} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default HomePage;
