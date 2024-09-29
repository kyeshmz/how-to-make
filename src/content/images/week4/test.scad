resolution = 1;  // Step size for discretization
r = 50;            // Range of x, y, z coordinates

for (x = [-r : resolution : r]) {
    for (y = [-r : resolution : r]) {
        for (z = [-r : resolution : r]) {
            // Evaluate Fischer-Koch equation
            val = cos(2 * x) * cos(2 * y) * cos(2 * z) - 
                  sin(2 * x) * sin(2 * y) * sin(2 * z);
            
            // If the result is close to zero, place a cube
            if (abs(val) < 0.1) {
                translate([x, y, z])
                    cube([resolution, resolution, resolution], center = true);
            }
        }
    }
}
