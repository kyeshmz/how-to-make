w = 10; // Cube width


// Define the cube using an implicit-like method
//for (x = [-w/2 : 1 : w/2]) {
//    for (y = [-w/2 : 1 : w/2]) {
//        for (z = [-w/2 : 1 : w/2]) {
            // Check if the point satisfies the max(abs(x), abs(y), abs(z)) = w/2 condition
//            if (max(abs(x), abs(y), abs(z)) <= w/2) {
//                translate([x, y, z]) {
//                    cube([1, 1, 1]);  // A small voxel representing part of the surface
//                }
//            }
//       }
//    }
//}
// CT
//
//r = 10;  // Radius of the sphere
//resolution = 1;  // Controls the voxel size for approximation
//
//// Loop over points in 3D space to approximate the sphere
//for (x = [-r : resolution : r]) {
//    for (y = [-r : resolution : r]) {
//        for (z = [-r : resolution : r]) {
//            // Implicit equation of a sphere: x^2 + y^2 + z^2 <= r^2
//            if (x*x + y*y + z*z <= r*r) {
//                translate([x, y, z])
//                    cube([resolution, resolution, resolution]);  // Small cube (voxel)
//            }
//        }
//    }
//}

//resolution = 1; // Step size for discretization
//r = 10;           // Range of x, y, z coordinates
//
//for (x = [-r : resolution : r]) {
//    for (y = [-r : resolution : r]) {
//        for (z = [-r : resolution : r]) {
//            if (abs(cos(x) + cos(y) + cos(z)) < 1.1) {
//                translate([x, y, z])
//                    cube([resolution, resolution, resolution], center = true);
//            }
//        }
//    }
//}

//resolution = 0.5;  // Step size for discretization
//r = 10;            // Range of x, y, z coordinates

//for (x = [-r : resolution : r]) {
//    for (y = [-r : resolution : r]) {
//        for (z = [-r : resolution : r]) {
//            // Evaluate Schwarz D equation
//            val = sin(x) * sin(y) * sin(z) + 
//                  sin(x) * cos(y) * cos(z) + 
//                  cos(x) * sin(y) * cos(z) + 
//                  cos(x) * cos(y) * sin(z);
//            
//            // If the result is close to zero, place a cube
//            if (abs(val) < 0.1) {
//                translate([x, y, z])
//                    cube([resolution, resolution, resolution], center = true);
//            }
//        }
//    }
//}

resolution = 0.1;  // Step size for discretization
r = 50;            // Range of x, y, z coordinates

for (x = [-r : resolution : r]) {
    for (y = [-r : resolution : r]) {
        for (z = [-r : resolution : r]) {
            // Evaluate Fischer-Koch equation
            val = cos(2 * x) * cos(2 * y) * cos(2 * z) - 
                  sin(2 * x) * sin(2 * y) * sin(2 * z);
            
            // If the result is close to zero, place a cube
            if (abs(val) < 0.001) {
                translate([x, y, z])
                    cube([resolution, resolution, resolution], center = true);
            }
        }
    }
}
