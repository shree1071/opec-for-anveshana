# VTU College Directory API Documentation

The CareerPath API provides access to data on ~219 VTU-affiliated engineering colleges in Karnataka.

## Base URL
`https://your-backend-url.onrender.com/api/colleges`

## Endpoints

### 1. Get All Colleges
Retrieve a paginated list of colleges.

*   **URL**: `/`
*   **Method**: `GET`
*   **Query Parameters**:
    *   `page` (int, optional): Page number (default: 1)
    *   `limit` (int, optional): Items per page (default: 20)
*   **Response**:
    ```json
    {
      "success": true,
      "data": [ ... ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 219,
        "total_pages": 11
      }
    }
    ```

### 2. Search Colleges
Search for colleges by name using partial matching.

*   **URL**: `/search`
*   **Method**: `GET`
*   **Query Parameters**:
    *   `q` (string, required): Search query (e.g., "Ramaiah")
*   **Response**:
    ```json
    {
      "success": true,
      "data": [ ... ],
      "count": 5
    }
    ```

### 3. Filter Colleges
Filter colleges by specific criteria.

*   **URL**: `/filter`
*   **Method**: `GET`
*   **Query Parameters**:
    *   `region` (string, optional): "Bangalore", "Mysore", "Belgaum", "Gulbarga"
    *   `type` (string, optional): "private", "government", "aided"
    *   `autonomous` (boolean, optional): "true" or "false"
*   **Response**:
    ```json
    {
      "success": true,
      "data": [ ... ],
      "count": 10
    }
    ```

### 4. Get College by ID
Retrieve detailed information for a specific college.

*   **URL**: `/:id`
*   **Method**: `GET`
*   **Response**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid...",
        "name": "R V College of Engineering",
        "code": "1RV",
        "courses": ["CSE", "ECE", ...],
        ...
      }
    }
    ```

### 5. Get Statistics
Get directory statistics.

*   **URL**: `/stats`
*   **Method**: `GET`
*   **Response**:
    ```json
    {
      "success": true,
      "data": {
        "total_colleges": 219,
        "by_region": { "Bangalore": 110, ... },
        "autonomous_count": 25,
        ...
      }
    }
    ```
