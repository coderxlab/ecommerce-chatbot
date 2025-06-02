import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import { getProductById, createProduct, updateProduct, uploadImage } from '../services/api';
import Loader from '../components/Loader';
import Message from '../components/Message';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [weight, setWeight] = useState(0);
  const [dimensions, setDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const product = await getProductById(id);
          
          setName(product.name);
          setPrice(product.price);
          setImage(product.image);
          setBrand(product.brand);
          setCategory(product.category);
          setCountInStock(product.countInStock);
          setDescription(product.description);
          setSku(product.sku || '');
          setWeight(product.weight || 0);
          setDimensions({
            length: product.dimensions?.length || 0,
            width: product.dimensions?.width || 0,
            height: product.dimensions?.height || 0,
          });
          
          setLoading(false);
        } catch (err) {
          setError('Failed to load product');
          setLoading(false);
          console.error(err);
        }
      };

      fetchProduct();
    }
  }, [id, isEditMode]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      setUploading(true);
      const data = await uploadImage(formData);
      setImage(data.imageUrl);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    const productData = {
      name,
      price,
      image,
      brand,
      category,
      countInStock,
      description,
      sku,
      weight,
      dimensions,
    };
    
    try {
      setLoading(true);
      
      if (isEditMode) {
        await updateProduct(id, productData);
        toast.success('Product updated successfully');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully');
      }
      
      navigate('/products');
    } catch (err) {
      setError(err.message || 'Failed to save product');
      toast.error(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Link to="/products" className="btn btn-light my-3">
        <FaArrowLeft /> Back to Products
      </Link>
      
      <Card className="form-container">
        <Card.Header>
          <h1>{isEditMode ? 'Edit Product' : 'Create Product'}</h1>
        </Card.Header>
        <Card.Body>
          {loading && <Loader />}
          {error && <Message variant="danger">{error}</Message>}
          
          <Form onSubmit={submitHandler}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="price">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3" controlId="image">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter image URL"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <Form.Control
                type="file"
                label="Choose file"
                onChange={uploadFileHandler}
                className="mt-2"
              />
              {uploading && <Loader />}
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="brand">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="category">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="countInStock">
                  <Form.Label>Count In Stock</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter count in stock"
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="sku">
                  <Form.Label>SKU</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter SKU"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="weight">
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </Form.Group>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="length">
                  <Form.Label>Length (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Length"
                    value={dimensions.length}
                    onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3" controlId="width">
                  <Form.Label>Width (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Width"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3" controlId="height">
                  <Form.Label>Height (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Height"
                    value={dimensions.height}
                    onChange={(e) => setDimensions({...dimensions, height: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Button type="submit" variant="primary" disabled={loading}>
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default ProductEdit;
