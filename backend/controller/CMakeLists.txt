cmake_minimum_required(VERSION 3.10)
project(SquawkController LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Source files
set(SRC src/pid.cpp)

# Build shared library
add_library(controller SHARED ${SRC})

# Output library name
set_target_properties(controller PROPERTIES
    OUTPUT_NAME "controller"
)
