#include <cmath>

extern "C" {

// PID state
static double integral = 0.0;
static double prev_error = 0.0;

void pid_reset() {
  integral = 0.0;
  prev_error = 0.0;
}

// Tunable gains (conservative to avoid oscillation)
static double Kp = 2.2;
static double Ki = 0.6;
static double Kd = 0.35;

// PID update: returns control effort (delta-thrust) given setpoint & measurement
double pid_update(double setpoint, double measurement, double dt) {
  double error = setpoint - measurement;
  integral += error * dt;
  double derivative = (error - prev_error) / (dt > 0 ? dt : 1e-6);
  prev_error = error;
  return Kp * error + Ki * integral + Kd * derivative;
}

}