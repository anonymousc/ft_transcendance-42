storage "file" 
{
    path = "/tmp"
}

listener "tcp"
{
    address = "0.0.0.0:port"
    tls_disable = 1
}