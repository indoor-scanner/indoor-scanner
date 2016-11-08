#include <math.h>
#include <string>
#include <sstream>
#include <fstream>
#include <iostream>
#include <pcl/io/pcd_io.h>
#include <pcl/point_types.h>
#include <pcl/registration/icp.h>
#include <vector>

#include <pcl/console/parse.h>
#include <pcl/common/transforms.h>
#include <pcl/visualization/pcl_visualizer.h>

#define PI 3.14159625

struct point_cloud {
  float x;
  float y;
  float z;
};

int main (int argc, char** argv) {
  pcl::PointCloud<pcl::PointXYZ>::Ptr scan1 (new pcl::PointCloud<pcl::PointXYZ>);
  pcl::PointCloud<pcl::PointXYZ>::Ptr scan2 (new pcl::PointCloud<pcl::PointXYZ>);

  // open file 1
  std::ifstream infile1(argv[1]);

  // add file contents into vectors below
  std::vector<float> radii;
  std::vector<float> thetas;
  std::vector<float> phis;

  float radius, theta, phi;
  std::string line;
  while (std::getline(infile1, line)) {
    std::istringstream iss(line);
    
    if (!(iss >> radius >> theta >> phi)) {
      break; // error
    }
    radii.push_back(radius);
    thetas.push_back(theta);
    phis.push_back(phi);
  }

  // convert into cartesian
  std::vector<point_cloud> points1;
  for (int i = 0; i < radii.size(); i++) {
    point_cloud temp = point_cloud();
    float temp_radius = radii[i];
    temp.z = temp_radius * sin(phis[i] * PI / 180) * cos(thetas[i] * PI / 180);
    temp.x = temp_radius * sin(phis[i] * PI / 180) * sin(thetas[i] * PI / 180);
    temp.y = temp_radius * cos(phis[i] * PI / 180);
    points1.push_back(temp);
  }

  // clear vectors

  radii.clear();
  thetas.clear();
  phis.clear();

  // open new file

  std::ifstream infile2(argv[2]);

  // add file contents into vectors below
  while (std::getline(infile2, line)) {
    std::istringstream iss(line);
    if (!(iss >> radius >> theta >> phi)) {
      break; // error
    }
    radii.push_back(radius);
    thetas.push_back(theta);
    phis.push_back(phi);
  }

  std::vector<point_cloud> points2;
  for (int i = 0; i < radii.size(); i++) {
    point_cloud temp = point_cloud();
    float temp_radius = radii[i];
    temp.z = temp_radius * sin(phis[i] * PI / 180) * cos(thetas[i] * PI / 180);
    temp.x = temp_radius * sin(phis[i] * PI / 180) * sin(thetas[i] * PI / 180);
    temp.y = temp_radius * cos(phis[i] * PI / 180);
    points2.push_back(temp);
  }

  // Fill in the CloudIn data
  scan1->is_dense = false;
  scan2->is_dense = false;
  scan1->points.resize (points1.size());
  scan2->points.resize (points2.size());

  for (size_t i = 0; i < scan1->points.size(); ++i) {
    scan1->points[i].x = points1[i].x;
    scan1->points[i].y = points1[i].y;
    scan1->points[i].z = points1[i].z;
  }

  for (size_t i = 0; i < scan2->points.size(); ++i) {
    scan2->points[i].x = points2[i].x;
    scan2->points[i].y = points2[i].y;
    scan2->points[i].z = points2[i].z;
  }


  std::cout << "Saved Scan 1" << scan1->points.size () << " data points to input:"
            << std::endl;
  for (size_t i = 0; i < scan1->points.size (); ++i) {
    std::cout << "    " << scan1->points[i].x << " " << scan1->points[i].y << " " 
              << scan1->points[i].z << std::endl;
  }

  std::cout << "Saved Scan 2 " << scan2->points.size () << " data points:"
            << std::endl;

  for (size_t i = 0; i < scan2->points.size (); ++i) {
    std::cout << "    " << scan2->points[i].x << " " 
              << scan2->points[i].y << " " << scan2->points[i].z << std::endl;
  }

  pcl::IterativeClosestPoint<pcl::PointXYZ, pcl::PointXYZ> icp;
  icp.setMaximumIterations(1000);
  icp.setInputCloud(scan1);
  icp.setInputTarget(scan2);
  pcl::PointCloud<pcl::PointXYZ> Final;
  icp.align(Final);
  std::cout << "has converged:" << icp.hasConverged() << " score: " <<
  icp.getFitnessScore() << std::endl;
  Eigen::Matrix4f transform_1 = icp.getFinalTransformation();
  std::cout << icp.getFinalTransformation() << std::endl;


  // Executing the transformation
  pcl::PointCloud<pcl::PointXYZ>::Ptr transformed_cloud (new pcl::PointCloud<pcl::PointXYZ> ());
  // You can either apply transform_1 or transform_2; they are the same
  pcl::transformPointCloud (*scan2, *transformed_cloud, transform_1);


  // Visualization
  printf(  "\nPoint cloud colors :  white  = original point cloud\n"
      "                        red  = transformed point cloud\n");
  pcl::visualization::PCLVisualizer viewer ("Matrix transformation example");

   // Define R,G,B colors for the point cloud
  pcl::visualization::PointCloudColorHandlerCustom<pcl::PointXYZ> source_cloud_color_handler (scan1, 255, 255, 255);
  // We add the point cloud to the viewer and pass the color handler
  viewer.addPointCloud (scan1, source_cloud_color_handler, "original_cloud");

  pcl::visualization::PointCloudColorHandlerCustom<pcl::PointXYZ> transformed_cloud_color_handler (transformed_cloud, 230, 20, 20); // Red
  viewer.addPointCloud (transformed_cloud, transformed_cloud_color_handler, "transformed_cloud");

  viewer.addCoordinateSystem (1.0, "cloud", 0);
  viewer.setBackgroundColor(0.05, 0.05, 0.05, 0); // Setting background to a dark grey
  viewer.setPointCloudRenderingProperties (pcl::visualization::PCL_VISUALIZER_POINT_SIZE, 2, "original_cloud");
  viewer.setPointCloudRenderingProperties (pcl::visualization::PCL_VISUALIZER_POINT_SIZE, 2, "transformed_cloud");
  //viewer.setPosition(800, 400); // Setting visualiser window position

  while (!viewer.wasStopped ()) { // Display the visualiser until 'q' key is pressed
    viewer.spinOnce ();
  }


 return (0);
}