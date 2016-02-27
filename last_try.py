import urllib2
import argparse as ap


def query(url, site):
    response = urllib2.urlopen(url)
    html = response.read()
    prepped = prep(html, site)
    with open("tester.html", 'w') as f:
        f.write(prepped)
    
def prep(html, site):
    """
    CONNOR'S STUFF
    """
    return html


if __name__=='__main__':
    print "Starting"
    parser = ap.ArgumentParser(description="Data thingy")

    parser.add_argument('--food_pantry',  action='store_true')
    parser.add_argument('--legal_services',  action='store_true')
    parser.add_argument('stuff', nargs="+")
    
    args = parser.parse_args()

    print args
    stuff = args.stuff

    if args.food_pantry:
        city = stuff[0]
        state = stuff[1]

        print state

        string = "http://www.foodpantries.org/city.php?city=" + city + "&st=" + state
        query("http://www.foodpantries.org/city.php?city=leominster&st=MA",'fp')
    elif args.legal_services:
        pass
    else:
        print "NOTHING SPECIFIED IN CLI-ARGS"

    print "Done"
