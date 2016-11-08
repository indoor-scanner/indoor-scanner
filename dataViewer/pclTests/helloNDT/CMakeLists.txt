cmake_minimum_required(VERSION 2.8 FATAL_ERROR)

project(ndt_demo)

find_package(PCL 1.2 REQUIRED)

include_directories(${PCL_INCLUDE_DIRS})
link_directories(${PCL_LIBRARY_DIRS})
add_definitions(${PCL_DEFINITIONS})

add_executable (ndt_demo hello_ndt.cpp)
target_link_libraries (ndt_demo ${PCL_LIBRARIES})