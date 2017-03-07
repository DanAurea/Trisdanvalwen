## Documentation channels / binary
##https://media.readthedocs.org/pdf/channels/latest/channels.pdf
##http://www.devdungeon.com/content/working-binary-data-python
## Should result in something like this:
## b'\x00\x00\x00\x00\x004\x006\x00E\x002\x00A\x008\x004\x00f\x00$\x004\x001\x006\x00y\x008\x00&\x00D\x001\x008\x00c\x00_\x00S\x00e\x00\x00\x00\x10\x00c\x00e\x00c\x00i\x00 \x00e\x00s\x00t\x00 \x00u\x00n\x00 \x00t\x00e\x00s\x00t'

from time import time

class Packet(object):
	"""Class for constructing binary data based
		on a common API between client / server."""

	def __init__(self):
		## Define token in apps.py
		self.token = "46E2A84f$416y8&D18c_SeV41-D8zD9Q"
	
	def encode(self, message, packetID):
		"""
			Encode a message with API format
			DRPG + TokenServer + PacketID + Timestamp
			+ Data size + Data 
		"""
		content = ["DRPG", self.token, str(packetID), str(self.getTimestamp()), str(self.getDataSize(message)), message]
		packet = "".join(content)
		
		print(packet.encode("utf-8"))

	def decode(self, message):
		"""
			Decode a message with API format
			DRPG + TokenClient + PacketID + Timestamp
			+ Data size + Data 
		"""

		print(message.decode("utf-8"))

	def getDataSize(self, message):
		return len(message)

	def getTimestamp(self):
		""" 
			Get current timestamp.
		"""
		return int(time())

packet = Packet()
packet.encode("ceci est un test", 4)
packet.decode(b'\x00\x00\x00\x00\x004\x006\x00E\x002\x00A\x008\x004\x00f\x00$\x004\x001\x006\x00y\x008\x00&\x00D\x001\x008\x00c\x00_\x00S\x00e\x00\x00\x00\x10\x00c\x00e\x00c\x00i\x00 \x00e\x00s\x00t\x00 \x00u\x00n\x00 \x00t\x00e\x00s\x00t')