#https://machinelearningmastery.com/how-to-develop-lstm-models-for-time-series-forecasting/
#https://www.tensorflow.org/install/pip
#source ./venv/bin/activate  # sh, bash, ksh, or zsh
#deactivate  # don't exit until you're done using TensorFlow
#https://www.youtube.com/watch?v=f8ed_xAjkOg - tensorflow transform keras to tensorflowjs
#tensorflowjs_converter --input_format keras \
#./my_model.h5 \
#./tfjs_files
#Vanilla LSTM
# univariate lstm example
from numpy import array
from keras.models import Sequential
from keras.layers import LSTM
from keras.layers import Dense
import requests
# split a univariate sequence into samples
def split_sequence(sequence, n_steps):
	X, y = list(), list()
	for i in range(len(sequence)):
		# find the end of this pattern
		end_ix = i + n_steps
		# check if we are beyond the sequence
		if end_ix > len(sequence)-1:
			break
		# gather input and output parts of the pattern
		seq_x, seq_y = sequence[i:end_ix], sequence[end_ix]
		X.append(seq_x)
		y.append(seq_y)
	return array(X), array(y)
# define input sequence
r = requests.get('https://test.dokume.net/projects/coins/api.php?q=group_learn')
data = r.json()
raw_seq = []
for val in data:
	raw_seq.append(float(val['average_sentiment']))
#raw_seq = [10, 20, 30, 40, 50, 60, 70, 80, 90]

# choose a number of time steps
n_steps = 3
# split into samples
X, y = split_sequence(raw_seq, n_steps)
# reshape from [samples, timesteps] into [samples, timesteps, features]
n_features = 1
X = X.reshape((X.shape[0], X.shape[1], n_features))
# define model
model = Sequential()
model.add(LSTM(50, activation='relu', input_shape=(n_steps, n_features)))
model.add(Dense(1))
model.compile(optimizer='adam', loss='mse')
# fit model
model.fit(X, y, epochs=200, verbose=0)
# demonstrate prediction
#x_input = array([0.3959684972404417, 0.4197042705596311, 0.4312874519809592])
#x_input = array([70, 80, 90])
x_input = array([0.28045649937834105, 0.5651660770977243, 0.5207810850175385])
x_input = x_input.reshape((1, n_steps, n_features))
print(x_input)
yhat = model.predict(x_input, verbose=0)
print(yhat)
model.save('my_model.h5')