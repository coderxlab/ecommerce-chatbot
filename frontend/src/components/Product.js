import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { useCart } from '../context/CartContext';

const Product = ({ product }) => {
  const { addToCart } = useCart();

  const addToCartHandler = () => {
    addToCart(product._id, 1);
  };

  return (
    <Card className="product-card">
      <Link to={`/product/${product._id}`}>
        <Card.Img src={product.image} variant="top" />
      </Link>
      <Card.Body>
        <Link to={`/product/${product._id}`} className="text-decoration-none">
          <Card.Title as="div" className="product-title">
            {product.name}
          </Card.Title>
        </Link>

        <Card.Text as="div">
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </Card.Text>

        <Card.Text as="h3" className="product-price mt-2">
          ${product.price.toFixed(2)}
        </Card.Text>

        <Button
          onClick={addToCartHandler}
          className="btn-block w-100 mt-2"
          type="button"
          disabled={product.countInStock === 0}
        >
          {product.countInStock > 0 ? 'Add To Cart' : 'Out Of Stock'}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default Product;
