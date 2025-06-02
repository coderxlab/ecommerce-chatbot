#!/bin/bash
cd /workspace/backend
NODE_ENV=test npx jest --testPathPattern=__tests__/ordersByEmail.test.js