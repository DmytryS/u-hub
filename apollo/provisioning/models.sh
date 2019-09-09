kubectl delete configmap models
kubectl create configmap models --from-file=./../src/models/
