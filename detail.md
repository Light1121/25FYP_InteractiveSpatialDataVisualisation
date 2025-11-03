# WeatherJYJAM: Technical Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture & Design Rationale](#2-architecture--design-rationale)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Implementation Details](#5-implementation-details)
6. [API Documentation](#6-api-documentation)
7. [Data Flow & State Management](#7-data-flow--state-management)
8. [Security & Authentication](#8-security--authentication)
9. [Database Design](#9-database-design)
10. [Development Workflow](#10-development-workflow)

---

## 1. Project Overview

**WeatherJYJAM** is a full-stack web application that provides an interactive weather information platform with personalized user experiences. Users can search for weather stations across Australia, view real-time weather data on an interactive map, save favorite locations in custom tabs, and query weather information using AI-powered natural language search.

### Core Features
- **Interactive Map Interface**: Built with Leaflet.js for exploring weather stations geographically
- **Real-time Weather Data**: Access to comprehensive Australian weather station data
- **Personalized Tabs**: Users can create, update, and manage multiple custom tabs with saved map states
- **AI-Powered Search**: Natural language weather queries using OpenAI's GPT-4
- **User Authentication**: Secure JWT-based authentication system
- **Responsive Design**: Modern, mobile-friendly UI built with React and styled-components

---

## 2. Architecture & Design Rationale

### High-Level Architecture Decision

The application follows a **client-server architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                          │
│  React SPA + TypeScript + Vite + React Router + Leaflet     │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (JSON)
                       │ + JWT Authentication
┌──────────────────────┴──────────────────────────────────────┐
│                        SERVER TIER                           │
│         Flask + Flask-RESTX + SQLAlchemy + JWT               │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                       DATABASE TIER                          │
│  SQLite (Development) / Google Cloud SQL MySQL (Production)  │
└─────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

**1. Single Page Application (SPA) Frontend**
- **Rationale**: Modern user experience with instant navigation, no page reloads
- **Benefit**: Smooth interactions when panning the map, switching between tabs, and updating weather data
- **Technology**: React with React Router for client-side routing

**2. RESTful API Backend**
- **Rationale**: Platform-agnostic API design allows future mobile apps or third-party integrations
- **Benefit**: Clear contract between frontend and backend, easier testing and maintenance
- **Technology**: Flask-RESTX for self-documenting APIs with Swagger

**3. Model-View-Controller (MVC) Pattern in Backend**
- **Rationale**: Separation of concerns - data (Model), business logic (Service), and API endpoints (Controller)
- **Benefit**: Maintainable, testable, and scalable codebase
- **Structure**:
  ```
  app/
  ├── user/
  │   ├── model.py      # Data structure (SQLAlchemy ORM)
  │   ├── service.py    # Business logic
  │   └── controller.py # API endpoints (Flask-RESTX)
  ```

**4. Component-Based Frontend Architecture**
- **Rationale**: Reusable UI components with clear hierarchy
- **Benefit**: Consistent design, easier maintenance, faster feature development
- **Rule**: Maximum 3-level nesting (Page → Feature → Part)

**5. Context-Based State Management**
- **Rationale**: React Context API for global state instead of Redux
- **Benefit**: Simpler state management, less boilerplate, sufficient for app complexity
- **Implementation**: Separate contexts for Auth, Tabs, Pins, and ControlPanel

---

## 3. Technology Stack

### Frontend Stack

#### **React 19** - Core UI Framework
React was chosen as the primary frontend framework for several compelling reasons:

- **Component Reusability**: Our application has many repeated UI patterns (weather cards, tab controls, form inputs). React's component model allows us to write these once and reuse them everywhere.
  
- **Virtual DOM Performance**: The map interface requires frequent updates when users pan/zoom. React's reconciliation algorithm ensures only changed elements are re-rendered, keeping the UI responsive.

- **Rich Ecosystem**: Access to mature libraries like React Router (routing), React Leaflet (maps), and Recharts (data visualization).

- **TypeScript Integration**: First-class TypeScript support provides type safety, catching errors during development rather than production.

**Key React Features Used**:
- Hooks (useState, useEffect, useContext) for state management
- Context API for global state (user auth, tabs, map pins)
- Custom hooks for reusable logic (useAuth, useTabs, usePin)

#### **TypeScript** - Type Safety
TypeScript adds static typing to JavaScript, providing:

- **Compile-Time Error Detection**: Catch type errors before runtime
- **IntelliSense & Autocomplete**: Better developer experience in IDEs
- **Self-Documenting Code**: Type definitions serve as inline documentation
- **Refactoring Confidence**: Rename variables/functions safely across the codebase

Example type definition:
```typescript
interface Tab {
  id: number
  uid: string
  tab_name: string
  map?: {
    center: [number, number]
    zoom: number
  }
  pin?: {
    location: [number, number]
  }
}
```

#### **Vite** - Build Tool & Dev Server
Vite replaced traditional bundlers like Webpack because:

- **Lightning-Fast Hot Module Replacement (HMR)**: Changes reflect instantly during development
- **Native ES Modules**: No bundling during development, faster startup
- **Optimized Production Builds**: Uses Rollup for efficient bundling
- **Simple Configuration**: Minimal setup compared to Webpack

#### **React Router Dom** - Client-Side Routing
Handles navigation between pages (Home, Login, Profile, Details) without full page reloads:

```typescript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/signup" element={<SignUp />} />
  <Route path="/details" element={<Details />} />
</Routes>
```

#### **Leaflet.js + React-Leaflet** - Interactive Maps
Leaflet is a lightweight, open-source mapping library chosen for:

- **Open Source**: No API costs (unlike Google Maps)
- **Customizable**: Full control over map appearance and behavior
- **Performance**: Handles thousands of markers efficiently
- **React Integration**: React-Leaflet provides declarative map components

**Implementation**:
```typescript
<MapContainer center={[-25.2744, 133.7751]} zoom={4}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={[lat, lng]}>
    <Popup>Weather Station Info</Popup>
  </Marker>
</MapContainer>
```

#### **Styled-Components** - CSS-in-JS Styling
Styled-components was chosen over traditional CSS or CSS modules because:

- **Scoped Styles**: No CSS class name collisions
- **Dynamic Styling**: Props-based styling for component variants
- **Theme Support**: Consistent design system across the app
- **TypeScript Support**: Type-safe style props

Example:
```typescript
const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'primary' ? '#0066cc' : '#6c757d'};
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
`
```

#### **Recharts** - Data Visualization
For displaying weather trends and statistics:

- **React-Native**: Built specifically for React
- **Declarative API**: Easy to create charts with minimal code
- **Responsive**: Automatically adjusts to container size

---

### Backend Stack

#### **Flask 3.0** - Web Framework
Flask was chosen as the Python web framework because:

- **Lightweight & Flexible**: Minimal boilerplate, add only what you need
- **Excellent for APIs**: Perfect for building RESTful services
- **Strong Ecosystem**: Rich plugin ecosystem (Flask-RESTX, Flask-SQLAlchemy, Flask-JWT-Extended)
- **Python Language**: Easy to integrate with data processing, CSV handling, and machine learning libraries

**Why Flask over Django?**
- Django is opinionated and includes unnecessary features (admin panel, templating)
- Flask gives precise control over API structure
- Faster development for API-only backends

#### **Flask-RESTX** - REST API Framework
An extension of Flask-RESTPlus providing:

- **Automatic API Documentation**: Generates Swagger/OpenAPI docs automatically
- **Request Validation**: Built-in request parsing and validation
- **Namespace Organization**: Logical grouping of endpoints (`/api/auth`, `/api/weather`, `/api/my`)
- **Response Marshalling**: Consistent JSON response formatting

**Implementation Example**:
```python
api = Namespace('auth')

@api.route('/login')
class LoginApi(Resource):
    def post(self):
        """User login endpoint"""
        data = request.get_json()
        # Validation, authentication logic
        return {'access_token': token, 'user': user.to_dict()}
```

#### **SQLAlchemy** - ORM (Object-Relational Mapping)
SQLAlchemy abstracts database operations into Python objects:

- **Database Agnostic**: Same code works with SQLite (dev) and MySQL (production)
- **Type Safety**: Mapped columns with type hints
- **Relationship Management**: Handles foreign keys and joins automatically
- **Migration Support**: Easy schema evolution

**Model Definition**:
```python
class User(db.Model):
    __tablename__ = 'users'
    uid: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    tabs: Mapped[list["Tab"]] = relationship("Tab", back_populates="user")
```

#### **Flask-JWT-Extended** - JWT Authentication
Manages authentication tokens:

- **Stateless Authentication**: No server-side session storage needed
- **Token Expiration**: Automatic token invalidation after 30 days
- **Protected Routes**: Decorator-based route protection (`@jwt_required()`)
- **User Context**: Access current user in protected endpoints

**Flow**:
1. User logs in → Server generates JWT
2. Client stores JWT in localStorage
3. Subsequent requests include JWT in Authorization header
4. Server validates JWT and grants access

#### **bcrypt** - Password Hashing
Secure password storage:

- **One-Way Hashing**: Passwords cannot be decrypted
- **Salting**: Each password has unique salt, preventing rainbow table attacks
- **Configurable Complexity**: Adjustable hashing rounds for future-proofing

```python
def set_password(self, password: str):
    salt = bcrypt.gensalt()
    self.password = bcrypt.hashpw(password.encode(), salt).decode()

def check_password(self, password: str) -> bool:
    return bcrypt.checkpw(password.encode(), self.password.encode())
```

#### **OpenAI API** - AI-Powered Search
Integration with GPT-4 for natural language weather queries:

- **Tool Calling**: AI determines when to fetch live weather data
- **Streaming Responses**: Server-Sent Events (SSE) for real-time streaming
- **Context Awareness**: System prompt guides AI behavior

**Two-Stage Process**:
1. **First API Call**: Determine if weather data is needed
2. **Execute Tools**: Geocode location, fetch weather from Open-Meteo API
3. **Second API Call**: Generate natural language response with tool results

---

### Database Stack

#### **SQLite (Development)**
- **Zero Configuration**: File-based database, no server setup
- **Portable**: Database is a single file
- **Perfect for Development**: Fast, simple, no overhead

#### **Google Cloud SQL (Production)**
- **Managed Service**: Automatic backups, scaling, and maintenance
- **MySQL Engine**: Industry-standard relational database
- **High Availability**: Multi-region replication
- **Integration**: Cloud SQL Python Connector for secure connections

**Database Switching Logic**:
```python
use_cloud_sql = os.getenv("USE_CLOUD_SQL", "true").lower() == "true"

if use_cloud_sql:
    engine = connect_with_connector()  # Google Cloud SQL
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
```

---

## 4. System Architecture

### Overall System Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Application (SPA)                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────┐    │  │
│  │  │   Pages    │  │ Components │  │  Context Hooks  │    │  │
│  │  │  - Home    │  │  - Header  │  │  - AuthContext  │    │  │
│  │  │  - Login   │  │  - Map     │  │  - TabsContext  │    │  │
│  │  │  - Profile │  │  - Weather │  │  - PinContext   │    │  │
│  │  │  - Details │  │  - Sidebar │  │  - ControlPanel │    │  │
│  │  └────────────┘  └────────────┘  └─────────────────┘    │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │           API Layer (src/api/)                     │  │  │
│  │  │  - Auth API   - Tabs API   - Weather API          │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         │ HTTPS/REST API
                         │ JSON Data
                         │ JWT in Headers
                         │
┌────────────────────────▼───────────────────────────────────────┐
│                    FLASK BACKEND SERVER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Flask-RESTX API                         │  │
│  │  ┌──────────────────────────────────────────────────┐    │  │
│  │  │  Namespaces (Controllers)                        │    │  │
│  │  │  /api/auth    - Authentication endpoints         │    │  │
│  │  │  /api/me      - User profile endpoints           │    │  │
│  │  │  /api/my      - User tabs management             │    │  │
│  │  │  /api/weather - Weather data endpoints           │    │  │
│  │  │  /api/search  - Search & AI endpoints            │    │  │
│  │  └──────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐    │  │
│  │  │  Services (Business Logic)                       │    │  │
│  │  │  - UserService    - Authentication              │    │  │
│  │  │  - TabService     - Tab CRUD operations         │    │  │
│  │  │  - WeatherService - Weather data queries        │    │  │
│  │  │  - SearchService  - Search & AI integration     │    │  │
│  │  └──────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐    │  │
│  │  │  Models (SQLAlchemy ORM)                         │    │  │
│  │  │  - User          - UserProfile                   │    │  │
│  │  │  - Tab           - WeatherStation                │    │  │
│  │  └──────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Middleware & Extensions                      │  │
│  │  - Flask-CORS         - Cross-origin requests            │  │
│  │  - Flask-JWT-Extended - Token validation                 │  │
│  │  - SQLAlchemy         - Database ORM                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         │ SQL Queries
                         │
┌────────────────────────▼───────────────────────────────────────┐
│                   DATABASE LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SQLite (Development) / Cloud SQL MySQL (Production)     │  │
│  │                                                           │  │
│  │  Tables:                                                  │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────┐           │  │
│  │  │  users   │  │user_profiles │  │  tabs   │           │  │
│  │  │  ├─uid   │  │  ├─uid (FK)  │  │  ├─id   │           │  │
│  │  │  ├─name  │  │  ├─favour_t. │  │  ├─uid  │           │  │
│  │  │  ├─email │  │  └─pic        │  │  ├─name │           │  │
│  │  │  └─pass  │  └──────────────┘  │  ├─map  │           │  │
│  │  └──────────┘                     │  └─pin  │           │  │
│  │                                    └─────────┘           │  │
│  │                                                           │  │
│  │  ┌──────────────────────────┐                            │  │
│  │  │  stations                │                            │  │
│  │  │  ├─Station Name          │                            │  │
│  │  │  ├─state                 │                            │  │
│  │  │  ├─lat, lon              │                            │  │
│  │  │  └─weather data columns  │                            │  │
│  │  └──────────────────────────┘                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

External Services:
┌─────────────────────┐         ┌──────────────────────┐
│   OpenAI API        │         │  Open-Meteo API      │
│  (GPT-4 Mini)       │         │  (Weather Data)      │
│  - AI Search        │         │  - Live Weather      │
│  - Tool Calling     │         │  - Geocoding         │
└─────────────────────┘         └──────────────────────┘
```

### Frontend Architecture

The frontend follows a **hierarchical component structure** with strict nesting rules:

```
src/
├── pages/                    # PAGE LEVEL (Route Components)
│   ├── Home/
│   │   ├── Home.tsx          # Main page component
│   │   ├── index.tsx         # Clean export
│   │   └── _components/      # FEATURE LEVEL
│   │       ├── Dashboard/    # Complex feature (folder)
│   │       │   ├── Dashboard.tsx
│   │       │   ├── index.tsx
│   │       │   └── MapView/  # PART LEVEL (Max depth)
│   │       │       └── MapView.tsx
│   │       └── BottomSheet/  # Feature-specific component
│   │           └── ...
│   ├── Login/
│   ├── Profile/
│   ├── SignUp/
│   └── Details/
│
├── _components/              # UNIVERSAL COMPONENTS (Reusable)
│   ├── Header/               # App header
│   ├── Sidebar/              # Navigation sidebar
│   ├── Layout/               # Layout components
│   ├── Button.tsx            # Common button
│   ├── Dropdown.tsx          # Dropdown component
│   └── ContextHooks/         # Global state management
│       ├── AuthContext.tsx   # User authentication state
│       ├── TabsContext.tsx   # User tabs state
│       ├── PinContext.tsx    # Map pins state
│       └── ControlPanelContext.tsx
│
├── api/                      # API LAYER
│   ├── config.ts             # API base URL & endpoints
│   ├── auth.ts               # Authentication API calls
│   ├── tabs.ts               # Tabs API calls
│   ├── weather.ts            # Weather API calls
│   └── search.ts             # Search API calls
│
├── _assets/                  # Static assets (images, icons)
├── App.tsx                   # Root component with routing
└── main.tsx                  # Application entry point
```

**Design Rules**:
1. **Maximum 3-level nesting**: Page → Feature → Part (prevents complexity)
2. **index.tsx for exports**: Clean imports (`import Header from './Header'`)
3. **_components prefix**: Visual distinction for internal components
4. **Universal vs Page components**: Reusable components in `src/_components`, page-specific in `pages/[Page]/_components`

### Backend Architecture (MVC Pattern)

```
app/
├── __init__.py               # Flask app factory
├── database.py               # SQLAlchemy configuration
│
├── user/                     # USER MODULE
│   ├── model.py              # User & UserProfile models
│   ├── service.py            # User business logic
│   ├── controller.py         # /api/auth & /api/me endpoints
│   └── schema.py             # Request/response validation
│
├── tabs/                     # TABS MODULE
│   ├── model.py              # Tab model
│   ├── service.py            # Tab CRUD operations
│   ├── controller.py         # /api/my/tabs endpoints
│   └── schema.py             # Tab validation
│
├── weather/                  # WEATHER MODULE
│   ├── model.py              # WeatherStation model
│   ├── service.py            # Weather data queries
│   ├── controller.py         # /api/weather endpoints
│   ├── getstation.py         # Haversine distance calculation
│   └── schema.py             # Weather data validation
│
├── search/                   # SEARCH MODULE
│   ├── service.py            # Search & AI logic
│   ├── controller.py         # /api/search endpoints
│   ├── prompt.py             # AI system prompt
│   └── tools.py              # Geocoding & weather fetching
│
└── _utils/                   # UTILITIES
    └── serializer.py         # Model-to-dict conversion
```

**MVC Flow Example** (User Login):
1. **Controller** (`user/controller.py`): Receives POST request to `/api/auth/login`
2. **Service** (`user/service.py`): `authenticate_user(email, password)` validates credentials
3. **Model** (`user/model.py`): `User.check_password()` compares hashed password
4. **Controller**: Returns JWT token and user data

---

## 5. Implementation Details

### 5.1 Frontend Implementation

#### Routing Configuration

The application uses React Router Dom v7 for client-side routing:

```typescript
// App.tsx
const App: FC = () => (
  <AuthProvider>
    <TabsProvider>
      <PinProvider>
        <ControlPanelProvider>
          <TabsPinIntegration />
          <AuthTabsSync />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/details" element={<Details />} />
          </Routes>
        </ControlPanelProvider>
      </PinProvider>
    </TabsProvider>
  </AuthProvider>
)
```

**Context Providers Explained**:
- **AuthProvider**: Manages user login state, JWT token storage
- **TabsProvider**: Manages user's saved tabs
- **PinProvider**: Manages map pin state
- **ControlPanelProvider**: Manages UI panel visibility
- **TabsPinIntegration**: Syncs tabs and pins bidirectionally
- **AuthTabsSync**: Loads user tabs on login, clears on logout

#### State Management Pattern

The app uses **React Context API** with custom hooks for state management:

**Example: Authentication Context**

```typescript
// _components/ContextHooks/AuthContext.tsx
interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  login: (token: string, userData: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if token exists on mount
    const token = localStorage.getItem('jwt_token')
    if (token) {
      // Fetch user profile
      fetchUserProfile()
    }
  }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem('jwt_token', token)
    setUser(userData)
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem('jwt_token')
    setUser(null)
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

**Usage in Components**:
```typescript
const LoginPage: FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (email: string, password: string) => {
    const response = await loginAPI(email, password)
    if (response.success) {
      login(response.access_token, response.user)
      navigate('/')
    }
  }
  // ...
}
```

#### API Integration

All API calls are centralized in `src/api/`:

```typescript
// src/api/config.ts
export const API_BASE_URL = 'https://weatherjyjam-production.up.railway.app'

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/api/auth/login`,
  myTabs: `${API_BASE_URL}/api/my/tabs`,
  weatherNearest: `${API_BASE_URL}/api/weather/nearest`,
  // ...
}

export const getAuthHeader = () => {
  const token = localStorage.getItem('jwt_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
```

```typescript
// src/api/auth.ts
export const loginAPI = async (email: string, password: string) => {
  const response = await fetch(API_ENDPOINTS.login, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return await response.json()
}

export const fetchUserProfile = async () => {
  const response = await fetch(API_ENDPOINTS.me, {
    headers: getAuthHeader()
  })
  return await response.json()
}
```

#### Map Implementation

Interactive map using Leaflet.js:

```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

const WeatherMap: FC = () => {
  const { pin, setPin } = usePin()
  const [weatherData, setWeatherData] = useState(null)

  useEffect(() => {
    if (pin.location) {
      // Fetch nearest weather station
      fetch(`${API_ENDPOINTS.weatherNearest}?lat=${pin.location[0]}&lng=${pin.location[1]}`)
        .then(res => res.json())
        .then(data => setWeatherData(data))
    }
  }, [pin.location])

  return (
    <MapContainer
      center={[-25.2744, 133.7751]}
      zoom={4}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {pin.location && (
        <Marker position={pin.location}>
          <Popup>
            <WeatherCard data={weatherData} />
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
```

### 5.2 Backend Implementation

#### Application Factory Pattern

Flask uses the **application factory pattern** for flexibility and testability:

```python
# app/__init__.py
def create_app():
    app = Flask(__name__)
    
    # Database configuration
    app.config["DATABASE_PATH"] = os.path.join(app.instance_path, "weather_app.db")
    
    # JWT configuration
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    
    # Initialize extensions
    init_db(app)
    jwt = JWTManager(app)
    CORS(app)
    
    # Register blueprints
    api.add_namespace(userapi)
    api.add_namespace(weatherapi)
    api.add_namespace(tabsapi)
    api.add_namespace(searchapi)
    app.register_blueprint(api_bp)
    
    return app
```

**Benefits**:
- Multiple app instances (testing, development, production)
- Configuration can be changed per instance
- Extensions initialized with app context

#### Database Connection Management

Supports both SQLite (development) and Google Cloud SQL (production):

```python
# app/database.py
def init_db(app):
    use_cloud_sql = os.getenv("USE_CLOUD_SQL", "true").lower() == "true"
    
    if use_cloud_sql:
        # Production: Google Cloud SQL
        engine = connect_with_connector()
        app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://"
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
            "creator": engine.raw_connection
        }
    else:
        # Development: Local SQLite
        db_path = app.config.get("DATABASE_PATH")
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    
    db.init_app(app)
    
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
```

#### Service Layer Pattern

Business logic is separated from API endpoints:

```python
# app/user/service.py
class UserService:
    def create_user(self, name: str, email: str, password: str) -> User:
        """Create a new user with hashed password"""
        user = User(name=name, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return user
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Validate user credentials"""
        user = db.session.query(User).filter_by(email=email).first()
        
        if user and user.check_password(password):
            return user
        
        return None
    
    def update_user(self, uid: str, name: str = None, 
                    email: str = None, password: str = None) -> Optional[User]:
        """Update user information"""
        user = db.session.get(User, uid)
        if not user:
            return None
        
        if name:
            user.name = name
        if email:
            user.email = email
        if password:
            user.set_password(password)
        
        db.session.commit()
        return user
```

#### Controller (API Endpoints)

Flask-RESTX Resources define API endpoints:

```python
# app/user/controller.py
api = Namespace('auth')
user_service = UserService()

@api.route('/login')
class LoginApi(Resource):
    def post(self):
        """User login endpoint
        
        Request Body:
        {
            "email": "user@example.com",
            "password": "password123"
        }
        
        Returns:
        {
            "success": true,
            "access_token": "eyJ0eXAiOiJKV1Q...",
            "user": {
                "uid": "uuid",
                "name": "User Name",
                "email": "user@example.com"
            }
        }
        """
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            api.abort(400, 'Email and password are required')
        
        user = user_service.authenticate_user(email, password)
        if not user:
            api.abort(401, 'Invalid credentials')
        
        # Create JWT token (expires in 30 days)
        access_token = create_access_token(
            identity=user.uid,
            expires_delta=datetime.timedelta(days=30)
        )
        
        return {
            'success': True,
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        }
```

#### Protected Endpoints with JWT

Flask-JWT-Extended provides decorator-based protection:

```python
# app/tabs/controller.py
api = Namespace('my')
tab_service = TabService()

@api.route('/tabs')
class MyTabsApi(Resource):
    @jwt_required()
    def get(self):
        """Get current user's tabs (JWT required)"""
        # current_user is automatically injected by Flask-JWT-Extended
        tabs = tab_service.get_user_tabs(current_user.uid)
        return {
            'tabs': [tab.to_dict() for tab in tabs]
        }
    
    @jwt_required()
    def put(self):
        """Update current user's tabs (JWT required)"""
        data = request.get_json() or {}
        tabs_data = data.get('tabs', [])
        
        updated_tabs = tab_service.update_all_tabs(
            current_user.uid, 
            tabs_data
        )
        
        return {
            'success': True,
            'tabs': [tab.to_dict() for tab in updated_tabs]
        }
```

**How JWT Protection Works**:
1. Client sends request with header: `Authorization: Bearer <token>`
2. `@jwt_required()` decorator validates token
3. If valid, `current_user` object is populated
4. If invalid/expired, returns 401 Unauthorized

#### AI-Powered Search Implementation

Two-stage AI search with tool calling:

```python
# app/search/service.py
class SearchService:
    def ai_search_stream(self, query: str) -> Generator[str, None, None]:
        """
        AI search with streaming response
        
        Process:
        1. First API call: Determine if weather data is needed
        2. If needed, execute tools (geocode, fetch weather)
        3. Second API call: Generate natural language response
        """
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Define available tools
        tools = [{
            "type": "function",
            "function": {
                "name": "get_live_weather",
                "description": "Get current weather for a location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"}
                    }
                }
            }
        }]
        
        # First call: Decide if tools are needed
        first = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": query}
            ],
            tools=tools,
            tool_choice="auto",
            stream=False
        )
        
        msgs = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": query}
        ]
        
        # If AI wants to use tools, execute them
        if first.choices[0].finish_reason == "tool_calls":
            for tool_call in first.choices[0].message.tool_calls:
                if tool_call.function.name == "get_live_weather":
                    args = json.loads(tool_call.function.arguments)
                    location = args.get("location")
                    
                    # Geocode location
                    geo = geocode_location(location)
                    
                    # Fetch weather data
                    weather = fetch_open_meteo(geo["lat"], geo["lon"])
                    
                    # Add tool result to messages
                    msgs.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(weather)
                    })
        
        # Second call: Generate response with tool results (streaming)
        stream = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=msgs,
            stream=True
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
```

**Server-Sent Events (SSE) for Streaming**:

```python
# app/search/controller.py
@api.route('/ai')
class SearchAiApi(Resource):
    def post(self):
        """AI search with SSE streaming"""
        data = request.get_json() or {}
        query = data.get('q', '')
        
        def generate():
            for chunk in search_service.ai_search_stream(query):
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"
        
        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={'Cache-Control': 'no-cache'}
        )
```

**Frontend Consumption**:
```typescript
const aiSearch = async (query: string) => {
  const response = await fetch(API_ENDPOINTS.searchAI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query })
  })
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const text = decoder.decode(value)
    const lines = text.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        
        // Update UI with streaming text
        setAIResponse(prev => prev + data)
      }
    }
  }
}
```

---

## 6. API Documentation

### 6.1 Authentication API

**Base Path**: `/api/auth`

#### POST `/api/auth/register`
Create a new user account.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "uid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Email already exists or missing fields
- `500 Internal Server Error`: Database error

---

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "uid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials

**JWT Token Details**:
- **Algorithm**: HS256
- **Expiration**: 30 days
- **Location**: Authorization header
- **Format**: `Bearer <token>`

---

#### POST `/api/auth/logout`
Logout user (client-side token removal).

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 6.2 User Profile API

**Base Path**: `/api/me`
**Authentication**: Required (JWT)

#### GET `/api/me/`
Get current user profile.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "user": {
    "uid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: User not found

---

### 6.3 Tabs Management API

**Base Path**: `/api/my`
**Authentication**: Required (JWT)

#### GET `/api/my/tabs`
Get all tabs for current user.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "tabs": [
    {
      "id": 1,
      "uid": "550e8400-e29b-41d4-a716-446655440000",
      "tab_name": "Sydney Weather",
      "map": {
        "center": [-33.8688, 151.2093],
        "zoom": 10
      },
      "pin": {
        "location": [-33.8688, 151.2093]
      }
    },
    {
      "id": 2,
      "uid": "550e8400-e29b-41d4-a716-446655440000",
      "tab_name": "Melbourne Weather",
      "map": {
        "center": [-37.8136, 144.9631],
        "zoom": 10
      },
      "pin": null
    }
  ]
}
```

---

#### PUT `/api/my/tabs`
Update all tabs for current user (replaces existing tabs).

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request**:
```json
{
  "tabs": [
    {
      "tab_name": "Updated Sydney",
      "map": {
        "center": [-33.8688, 151.2093],
        "zoom": 12
      },
      "pin": {
        "location": [-33.8688, 151.2093]
      }
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "tabs": [
    {
      "id": 3,
      "uid": "550e8400-e29b-41d4-a716-446655440000",
      "tab_name": "Updated Sydney",
      "map": {
        "center": [-33.8688, 151.2093],
        "zoom": 12
      },
      "pin": {
        "location": [-33.8688, 151.2093]
      }
    }
  ]
}
```

---

#### GET `/api/my/tabs/{tab_id}`
Get a specific tab by ID.

**Parameters**:
- `tab_id` (integer): Tab ID

**Response** (200 OK):
```json
{
  "id": 1,
  "uid": "550e8400-e29b-41d4-a716-446655440000",
  "tab_name": "Sydney Weather",
  "map": {
    "center": [-33.8688, 151.2093],
    "zoom": 10
  },
  "pin": {
    "location": [-33.8688, 151.2093]
  }
}
```

**Error Responses**:
- `404 Not Found`: Tab not found or doesn't belong to user

---

#### PUT `/api/my/tabs/{tab_id}`
Update a specific tab.

**Parameters**:
- `tab_id` (integer): Tab ID

**Request**:
```json
{
  "tab_name": "New Name",
  "map": {
    "center": [-33.8688, 151.2093],
    "zoom": 15
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "tab": {
    "id": 1,
    "uid": "550e8400-e29b-41d4-a716-446655440000",
    "tab_name": "New Name",
    "map": {
      "center": [-33.8688, 151.2093],
      "zoom": 15
    },
    "pin": {
      "location": [-33.8688, 151.2093]
    }
  }
}
```

---

#### DELETE `/api/my/tabs/{tab_id}`
Delete a specific tab.

**Parameters**:
- `tab_id` (integer): Tab ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Tab 1 deleted successfully"
}
```

**Error Responses**:
- `404 Not Found`: Tab not found

---

### 6.4 Weather Data API

**Base Path**: `/api/weather`

#### GET `/api/weather/`
Get all weather stations.

**Response** (200 OK):
```json
[
  {
    "Station Name": "Sydney Observatory Hill",
    "state": "NSW",
    "lat": -33.8607,
    "lon": 151.2053,
    "Temperature": 22.5,
    "Humidity": 65
  },
  // ... more stations
]
```

---

#### GET `/api/weather/{station_name}`
Get weather data for a specific station.

**Parameters**:
- `station_name` (string): Weather station name (URL encoded)

**Example**: `/api/weather/Sydney%20Observatory%20Hill`

**Response** (200 OK):
```json
{
  "Station Name": "Sydney Observatory Hill",
  "state": "NSW",
  "lat": -33.8607,
  "lon": 151.2053,
  "Temperature": 22.5,
  "Humidity": 65,
  "Wind Speed": 15.2,
  "Pressure": 1013.2
}
```

**Error Responses**:
- `404 Not Found`: Station not found

---

#### GET `/api/weather/avg_{station_name}`
Get average weather data for a station (historical averages).

**Parameters**:
- `station_name` (string): Weather station name

**Example**: `/api/weather/avg_Sydney%20Observatory%20Hill`

**Response** (200 OK):
```json
{
  "Station Name": "Sydney Observatory Hill",
  "avg_temperature": 21.3,
  "avg_humidity": 62.5,
  "avg_pressure": 1013.8
}
```

---

#### GET `/api/weather/nearest?lat={lat}&lng={lng}`
Get nearest weather station to coordinates.

**Query Parameters**:
- `lat` (float): Latitude
- `lng` (float): Longitude

**Example**: `/api/weather/nearest?lat=-33.8688&lng=151.2093`

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "station_name": "Sydney Observatory Hill",
    "distance_km": 2.4,
    "lat": -33.8607,
    "lon": 151.2053,
    "weather": {
      "Temperature": 22.5,
      "Humidity": 65
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid or missing lat/lng
- `404 Not Found`: No stations found

**Distance Calculation**: Uses Haversine formula to calculate great-circle distance:

```python
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in kilometers
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.asin(math.sqrt(a))
```

---

### 6.5 Search API

**Base Path**: `/api/search`

#### GET `/api/search?q={query}`
Search for weather stations by name.

**Query Parameters**:
- `q` (string): Search query

**Example**: `/api/search?q=Sydney`

**Response** (200 OK):
```json
{
  "query": "Sydney",
  "results": [
    {
      "name": "Sydney Observatory Hill, NSW",
      "station_name": "Sydney Observatory Hill",
      "state": "NSW",
      "lat": -33.8607,
      "lon": 151.2053
    },
    {
      "name": "Sydney Airport, NSW",
      "station_name": "Sydney Airport",
      "state": "NSW",
      "lat": -33.9399,
      "lon": 151.1753
    }
  ]
}
```

**Implementation**:
- SQL `LIKE` query: `WHERE Station Name LIKE '%{query}%'`
- Returns up to 50 results
- Sorted alphabetically

---

#### POST `/api/search/ai`
AI-powered natural language weather search with streaming response.

**Request**:
```json
{
  "q": "What's the weather like in Melbourne right now?"
}
```

**Response**: Server-Sent Events (SSE) stream

**Stream Format**:
```
data: The
data:  current
data:  weather
data:  in
data:  Melbourne
data:  is
data:  22°C
data:  with
data:  partly
data:  cloudy
data:  skies
data: .
data: [DONE]
```

**Client Implementation**:
```typescript
const eventSource = new EventSource(API_ENDPOINTS.searchAI)

eventSource.onmessage = (event) => {
  if (event.data === '[DONE]') {
    eventSource.close()
    return
  }
  
  setResponse(prev => prev + event.data)
}
```

**AI Features**:
- **Tool Calling**: AI decides when to fetch live weather data
- **Geocoding**: Converts location names to coordinates
- **Open-Meteo Integration**: Fetches real-time weather
- **Natural Language Output**: Formats response conversationally

---

## 7. Data Flow & State Management

### 7.1 Authentication Flow

```
┌──────────┐                                   ┌──────────┐
│  Client  │                                   │  Server  │
└─────┬────┘                                   └────┬─────┘
      │                                             │
      │  1. POST /api/auth/login                   │
      │  { email, password }                       │
      ├────────────────────────────────────────────>│
      │                                             │
      │                                             │  2. Query User
      │                                             │     by email
      │                                             │
      │                                             │  3. Verify password
      │                                             │     with bcrypt
      │                                             │
      │                                             │  4. Generate JWT
      │                                             │     (expires: 30d)
      │                                             │
      │  5. Response: { access_token, user }       │
      │<────────────────────────────────────────────┤
      │                                             │
      │  6. Store token in localStorage             │
      │     localStorage.setItem('jwt_token', ...)  │
      │                                             │
      │  7. Update AuthContext state                │
      │     setIsLoggedIn(true)                     │
      │     setUser(userData)                       │
      │                                             │
      │  8. All subsequent requests include:        │
      │     Authorization: Bearer <token>           │
      │                                             │
      │  9. GET /api/my/tabs                        │
      │     Headers: { Authorization: Bearer ... }  │
      ├────────────────────────────────────────────>│
      │                                             │
      │                                             │ 10. Verify JWT
      │                                             │     signature
      │                                             │
      │                                             │ 11. Extract user_id
      │                                             │     from token
      │                                             │
      │                                             │ 12. Query user's
      │                                             │     tabs
      │                                             │
      │  13. Response: { tabs: [...] }             │
      │<────────────────────────────────────────────┤
      │                                             │
```

### 7.2 Tab Management Flow

When a user modifies a tab (e.g., moves the map or adds a pin):

```
┌───────────┐         ┌──────────────┐         ┌──────────────┐
│  User UI  │         │   Context    │         │   Backend    │
└─────┬─────┘         └──────┬───────┘         └──────┬───────┘
      │                      │                        │
      │  User drags map      │                        │
      │  to new location     │                        │
      ├─────────────────────>│                        │
      │                      │                        │
      │                      │  Update map state      │
      │                      │  in TabsContext        │
      │                      │                        │
      │                      │  Debounce 500ms        │
      │                      │  (avoid excessive      │
      │                      │   API calls)           │
      │                      │                        │
      │                      │  PUT /api/my/tabs/{id} │
      │                      ├───────────────────────>│
      │                      │  { map: { center, zoom }}
      │                      │                        │
      │                      │                        │  Update database
      │                      │                        │  (SQLAlchemy)
      │                      │                        │
      │                      │  Response: { tab: {...}}
      │                      │<───────────────────────┤
      │                      │                        │
      │  UI reflects         │                        │
      │  updated state       │                        │
      │<─────────────────────┤                        │
      │                      │                        │
```

### 7.3 Context Integration

The app uses multiple contexts that communicate with each other:

**TabsPinIntegration Component**:

```typescript
export const TabsPinIntegration: FC = () => {
  const { activeTab, updateTab } = useTabs()
  const { pin, setPin } = usePin()

  // When pin changes, update active tab
  useEffect(() => {
    if (activeTab && pin.location) {
      updateTab(activeTab.id, {
        ...activeTab,
        pin: { location: pin.location }
      })
    }
  }, [pin.location])

  // When active tab changes, update pin
  useEffect(() => {
    if (activeTab?.pin?.location) {
      setPin({ location: activeTab.pin.location })
    }
  }, [activeTab?.id])

  return null // No UI, just synchronization logic
}
```

**AuthTabsSync Component**:

```typescript
export const AuthTabsSync: FC = () => {
  const { isLoggedIn, user } = useAuth()
  const { setTabs, clearTabs } = useTabs()

  useEffect(() => {
    if (isLoggedIn) {
      // Load user's tabs from backend
      fetchUserTabs().then(tabs => setTabs(tabs))
    } else {
      // Clear tabs on logout
      clearTabs()
    }
  }, [isLoggedIn])

  return null
}
```

This architecture ensures:
- **Separation of Concerns**: Each context manages one domain
- **Automatic Synchronization**: Changes propagate automatically
- **Persistence**: Tab states are saved to backend
- **Clean Components**: Components don't need to know about sync logic

---

## 8. Security & Authentication

### 8.1 Password Security

**Hashing with bcrypt**:

```python
class User(db.Model):
    def set_password(self, password: str) -> None:
        """Hash password with salt"""
        salt = bcrypt.gensalt(rounds=12)  # 2^12 iterations
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        self.password = hashed.decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password.encode('utf-8')
        )
```

**Security Features**:
- **Salting**: Each password has unique salt (stored with hash)
- **Slow Hashing**: Intentionally slow to prevent brute-force attacks
- **One-Way**: Cannot decrypt password from hash
- **Future-Proof**: Can increase rounds as hardware improves

### 8.2 JWT Token Security

**Token Structure**:
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY...
│──────── Header ──────────────│─────────── Payload ────────────│── Signature ──│
```

**Header**:
```json
{
  "typ": "JWT",
  "alg": "HS256"
}
```

**Payload**:
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",  // User ID
  "iat": 1699564800,  // Issued at (timestamp)
  "exp": 1702243200   // Expiration (30 days later)
}
```

**Signature**: HMAC-SHA256 of header + payload + secret key

**Security Properties**:
- **Tamper-Proof**: Any modification invalidates signature
- **Stateless**: No server-side session storage needed
- **Expiration**: Tokens automatically expire after 30 days
- **Secret Key**: Stored in environment variable (never in code)

### 8.3 CORS Configuration

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow all origins (development)

# Production configuration (more restrictive):
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://weatherjyjam.com"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### 8.4 Environment Variables

Sensitive configuration is stored in environment variables:

**Backend (.env.local)**:
```bash
# Flask Configuration
FLASK_APP_NAME=WeatherJYJAM_app
FLASK_ENV=development

# JWT Secret (MUST be changed in production)
JWT_SECRET_KEY=your-secret-key-change-in-production

# Database Configuration
USE_CLOUD_SQL=false  # true for production
INSTANCE_CONNECTION_NAME=project:region:instance
DB_USER=username
DB_PASS=password
DB_NAME=weather_db

# OpenAI API
OPENAI_API_KEY=sk-...
```

**Frontend (src/api/config.ts)**:
```typescript
const USE_LOCAL = false  // Toggle for development

const LOCAL_API_URL = 'http://127.0.0.1:2333'
const PRODUCTION_API_URL = 'https://weatherjyjam-production.up.railway.app'

export const API_BASE_URL = USE_LOCAL ? LOCAL_API_URL : PRODUCTION_API_URL
```

**Security Best Practices**:
- Never commit `.env.local` to version control (in `.gitignore`)
- Use different secrets for development/production
- Rotate secrets regularly
- Use strong, random secret keys (minimum 32 characters)

---

## 9. Database Design

### 9.1 Entity-Relationship Diagram

```
┌────────────────────┐
│       users        │
├────────────────────┤
│ uid (PK)           │ VARCHAR(36) UUID
│ name               │ VARCHAR(100)
│ email (UNIQUE)     │ VARCHAR(255)
│ password           │ VARCHAR(255) bcrypt hash
└──────────┬─────────┘
           │
           │ 1:1
           │
┌──────────▼─────────┐
│  user_profiles     │
├────────────────────┤
│ uid (PK, FK)       │ → users.uid
│ favour_tabs        │ VARCHAR(100) tab ID
│ pic                │ VARCHAR(500) URL/path
└────────────────────┘
           │
           │ 1:N
           │
┌──────────▼─────────┐
│       tabs         │
├────────────────────┤
│ id (PK)            │ INTEGER AUTO_INCREMENT
│ uid (FK)           │ → users.uid
│ tab_name           │ VARCHAR(100)
│ map                │ JSON { center: [lat, lng], zoom: number }
│ pin                │ JSON { location: [lat, lng] }
└────────────────────┘


┌──────────────────────────────┐
│          stations            │
├──────────────────────────────┤
│ Station Name (PK)            │ VARCHAR(255)
│ state                        │ VARCHAR(50)
│ lat                          │ FLOAT
│ lon                          │ FLOAT
│ Temperature                  │ FLOAT
│ Humidity                     │ FLOAT
│ Wind Speed                   │ FLOAT
│ Pressure                     │ FLOAT
│ ... (additional weather cols)│
└──────────────────────────────┘
```

### 9.2 Table Definitions

#### **users** Table

```sql
CREATE TABLE users (
    uid VARCHAR(36) PRIMARY KEY,           -- UUID
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,        -- bcrypt hash
    INDEX idx_email (email)                -- Fast email lookup
);
```

**Relationships**:
- One-to-one with `user_profiles`
- One-to-many with `tabs`

**Constraints**:
- `email` must be unique (enforced by database)
- `password` stored as bcrypt hash (never plaintext)

---

#### **user_profiles** Table

```sql
CREATE TABLE user_profiles (
    uid VARCHAR(36) PRIMARY KEY,
    favour_tabs VARCHAR(100),              -- Reference to favorite tab
    pic VARCHAR(500),                      -- Profile picture URL
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);
```

**Cascade Deletion**: When user is deleted, profile is automatically deleted.

---

#### **tabs** Table

```sql
CREATE TABLE tabs (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(36) NOT NULL,
    tab_name VARCHAR(100) NOT NULL,
    map JSON,                              -- { center: [lat, lng], zoom: number }
    pin JSON,                              -- { location: [lat, lng] }
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE,
    INDEX idx_uid (uid)                    -- Fast user lookup
);
```

**JSON Fields**:
- `map`: Stores map viewport state
- `pin`: Stores marker location

**Example JSON Data**:
```json
{
  "map": {
    "center": [-33.8688, 151.2093],
    "zoom": 10
  },
  "pin": {
    "location": [-33.8688, 151.2093]
  }
}
```

---

#### **stations** Table

```sql
CREATE TABLE stations (
    `Station Name` VARCHAR(255) PRIMARY KEY,
    state VARCHAR(50),
    lat FLOAT,
    lon FLOAT,
    Temperature FLOAT,
    Humidity FLOAT,
    `Wind Speed` FLOAT,
    Pressure FLOAT,
    -- Additional weather columns...
    INDEX idx_state (state),
    INDEX idx_location (lat, lon)
);
```

**Data Source**: Australian Bureau of Meteorology weather station data

---

### 9.3 Database Migrations

SQLAlchemy automatically creates tables:

```python
with app.app_context():
    db.create_all()  # Creates all tables based on models
```

**For Schema Changes** (Manual Process):

1. Update model definition
2. Delete database (development only!)
3. Restart server (tables recreated)

**Production Migration** (using Alembic):
```bash
# Initialize Alembic
alembic init migrations

# Create migration
alembic revision --autogenerate -m "Add new column"

# Apply migration
alembic upgrade head
```

---

## 10. Development Workflow

### 10.1 Backend Development

**Setup**:
```bash
cd Backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cat > .env.local << EOF
FLASK_APP_NAME=WeatherJYJAM_app
FLASK_ENV=development
JWT_SECRET_KEY=$(openssl rand -hex 32)
USE_CLOUD_SQL=false
EOF

# Run server
python server.py
```

**Development Server**:
- URL: `http://localhost:2333`
- Auto-reload: Disabled in production, enable with `debug=True`
- Database: SQLite at `instance/weather_app.db`

**Testing API Endpoints**:
```bash
# Register user
curl -X POST http://localhost:2333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:2333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Get user tabs (replace TOKEN)
curl -X GET http://localhost:2333/api/my/tabs \
  -H "Authorization: Bearer TOKEN"
```

---

### 10.2 Frontend Development

**Setup**:
```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Development Server**:
- URL: `http://localhost:5173` (Vite default)
- Hot Module Replacement: Instant updates on file save
- API Proxy: Configure in `vite.config.ts` if needed

**Code Quality Tools**:
```bash
# Format code
npm run format

# Lint JavaScript/TypeScript
npm run lint:fix

# Lint CSS
npm run lint:css:fix

# Type check
npm run type-check

# All checks (pre-commit)
npm run pre-commit
```

---

### 10.3 Project Structure Standards

**Naming Conventions**:
- **Components**: PascalCase (`WeatherCard.tsx`)
- **Files/Folders**: camelCase (`weatherUtils.ts`)
- **Internal Dirs**: `_prefix` (`_components/`, `_utils/`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

**Import Organization**:
```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Internal components
import { Header, Sidebar } from '../../_components'

// 3. Local components
import WeatherCard from './_components/WeatherCard'

// 4. Utilities
import { formatDate } from '../../_utils/dateUtils'

// 5. Types
import type { User, Tab } from '../../types'
```

---

### 10.4 Deployment

**Backend Deployment** (Railway):
```yaml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "python server.py"
healthcheckPath = "/api/weather/"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
```

**Environment Variables** (set in Railway dashboard):
```
USE_CLOUD_SQL=true
INSTANCE_CONNECTION_NAME=project:region:instance
DB_USER=username
DB_PASS=password
DB_NAME=weather_db
JWT_SECRET_KEY=production-secret-key
OPENAI_API_KEY=sk-...
```

**Frontend Deployment** (Vercel/Netlify):
```bash
# Build production bundle
npm run build

# Output: dist/ directory

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

**Production Checklist**:
- [ ] Change `JWT_SECRET_KEY` to strong random value
- [ ] Set `USE_CLOUD_SQL=true`
- [ ] Configure Cloud SQL instance
- [ ] Update frontend `API_BASE_URL` to production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring (logs, errors)
- [ ] Configure CORS for production domain only

---

## Appendix A: Sample Source Code

### Sample 1: User Authentication Service (50 lines)

**File**: `Backend/app/user/service.py`

This service handles all user-related business logic including registration, authentication, and profile management. It demonstrates the service layer pattern, database interactions with SQLAlchemy ORM, and secure password handling.

```python
from typing import List, Optional
from app.user.model import User
from app.database import db


class UserService:
    """
    User service layer for business logic.
    
    This service handles all user-related operations including authentication,
    user creation, and profile management. It separates business logic from
    API endpoints, making the code more testable and maintainable.
    """
    
    def create_user(self, name: str, email: str, password: str) -> User:
        """
        Create a new user with hashed password.
        
        Requirement Satisfied: User Registration (FR-001)
        - Validates input data
        - Hashes password using bcrypt
        - Stores user in database
        
        Args:
            name: User's full name
            email: User's email address (must be unique)
            password: Plain text password (will be hashed)
        
        Returns:
            User: Newly created user object
        
        Raises:
            IntegrityError: If email already exists
        """
        user = User(name=name, email=email)
        user.set_password(password)  # Hash password with bcrypt
        
        db.session.add(user)
        db.session.commit()  # Persist to database
        
        return user
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate user by email and password.
        
        Requirement Satisfied: User Authentication (FR-002)
        - Verifies user credentials
        - Uses bcrypt to check password hash
        - Returns user object on success, None on failure
        
        Args:
            email: User's email address
            password: Plain text password to verify
        
        Returns:
            User object if authentication successful, None otherwise
        """
        if not password or not email:
            return None
        
        # Query user by email (indexed for performance)
        user = db.session.query(User).filter_by(email=email).first()
        
        # Verify password using bcrypt
        if user and user.check_password(password):
            return user
        
        return None
```

---

### Sample 2: Tab Management Controller (50 lines)

**File**: `Backend/app/tabs/controller.py`

This controller handles tab management endpoints. It demonstrates Flask-RESTX Resource classes, JWT authentication, and RESTful API design.

```python
from flask import request
from flask_restx import Resource, Namespace
from flask_jwt_extended import jwt_required, current_user
from app.tabs.service import TabService


api = Namespace('my')
tab_service = TabService()


@api.route('/tabs')
class MyTabsApi(Resource):
    """
    Tab collection endpoint for authenticated users.
    
    Requirement Satisfied: Personalized Tab Management (FR-005)
    """
    
    @jwt_required()
    def get(self):
        """
        Get current user's tabs.
        
        Authentication: JWT required in Authorization header
        
        Returns:
            JSON response with list of user's tabs
            
        Example Response:
        {
            "tabs": [
                {
                    "id": 1,
                    "tab_name": "Sydney Weather",
                    "map": {"center": [-33.8688, 151.2093], "zoom": 10},
                    "pin": {"location": [-33.8688, 151.2093]}
                }
            ]
        }
        """
        # current_user is automatically injected by Flask-JWT-Extended
        tabs = tab_service.get_user_tabs(current_user.uid)
        
        # Convert SQLAlchemy models to dictionaries
        return {
            'tabs': [tab.to_dict() for tab in tabs]
        }
    
    @jwt_required()
    def put(self):
        """
        Update current user's tabs (bulk update).
        
        Requirement Satisfied: Tab Persistence (FR-006)
        
        Request Body:
        {
            "tabs": [
                {
                    "tab_name": "New Tab",
                    "map": {"center": [lat, lng], "zoom": number},
                    "pin": {"location": [lat, lng]}
                }
            ]
        }
        
        Returns:
            JSON response with updated tabs
        """
        data = request.get_json() or {}
        tabs_data = data.get('tabs', [])
        
        # Service layer handles business logic
        updated_tabs = tab_service.update_all_tabs(current_user.uid, tabs_data)
        
        return {
            'success': True,
            'tabs': [tab.to_dict() for tab in updated_tabs]
        }
```

---

## Appendix B: Complete API Endpoint List

### Authentication & User Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create new user account |
| POST | `/api/auth/login` | No | Login and receive JWT token |
| POST | `/api/auth/logout` | No | Logout (client-side) |
| GET | `/api/me/` | Yes | Get current user profile |

### Tab Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/my/tabs` | Yes | Get all user tabs |
| PUT | `/api/my/tabs` | Yes | Update all user tabs |
| GET | `/api/my/tabs/{id}` | Yes | Get specific tab |
| PUT | `/api/my/tabs/{id}` | Yes | Update specific tab |
| DELETE | `/api/my/tabs/{id}` | Yes | Delete specific tab |

### Weather Data
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/weather/` | No | Get all weather stations |
| GET | `/api/weather/{station}` | No | Get weather by station name |
| GET | `/api/weather/avg_{station}` | No | Get average weather data |
| GET | `/api/weather/nearest?lat=&lng=` | No | Get nearest station |

### Search
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search?q={query}` | No | Search weather stations |
| POST | `/api/search/ai` | No | AI-powered natural language search |

---

## Appendix C: Technology Dependencies

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^19.1.1",                    // UI framework
    "react-dom": "^19.1.1",                // React DOM bindings
    "react-router-dom": "^7.8.0",          // Client-side routing
    "styled-components": "^6.1.19",        // CSS-in-JS styling
    "leaflet": "^1.9.4",                   // Map library
    "react-leaflet": "^5.0.0",             // React Leaflet bindings
    "recharts": "^3.2.1"                   // Data visualization
  },
  "devDependencies": {
    "typescript": "~5.8.3",                // Type safety
    "vite": "^7.1.2",                      // Build tool
    "eslint": "^9.33.0",                   // Code linting
    "prettier": "^3.6.2",                  // Code formatting
    "stylelint": "^16.23.1"                // CSS linting
  }
}
```

### Backend Dependencies
```
Flask>=3.0.0                              # Web framework
flask-restx>=1.3.0                        # REST API framework
Flask-SQLAlchemy==3.1.1                   # ORM
Flask-JWT-Extended>=4.6.0                 # JWT authentication
Flask-Cors>=3.0.10                        # CORS handling
bcrypt>=4.0.0                             # Password hashing
python-dotenv==1.0.0                      # Environment variables
openai>=1.0.0                             # OpenAI API client
cloud-sql-python-connector[pymysql]       # Cloud SQL connector
requests>=2.31.0                          # HTTP client
```

---

## Conclusion

WeatherJYJAM is a modern, full-stack web application demonstrating best practices in:
- **Architecture**: Clean separation of concerns with MVC pattern
- **Security**: JWT authentication, bcrypt password hashing, CORS
- **Scalability**: Modular design, service layers, context-based state management
- **User Experience**: Responsive design, real-time map interactions, AI-powered search
- **Developer Experience**: TypeScript type safety, automatic API documentation, hot reloading

The application successfully combines multiple technologies into a cohesive platform that provides users with intuitive access to weather data across Australia while maintaining secure, personalized experiences through user accounts and customizable tabs.

